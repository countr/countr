import "./api";
import { clusterList, getCombinedData, shardList } from "./lists";
import type { CommunicationMessage } from "../communication";
import { CommunicationType } from "../communication";
import { Status } from "discord.js";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { addToWeeklyCount } from "./weeklyCount";
import config from "../../../config";
import { getPresence } from "./presence";
import { managerLogger } from "../../logger/manager";

const wss = new WebSocketServer({ port: config.websocket.port });

const clusterWebsockets = new Map<number, WebSocket>();
const clusterRequestStatsIntervals = new Map<number, NodeJS.Timer>();
const clusterConnectQueue = new Set<number>();

wss.on("connection", ws => {
  ws.once("message", initData => {
    const initMessage = JSON.parse(initData as unknown as string) as CommunicationMessage;
    managerLogger.http(`Received message: ${JSON.stringify(initMessage)}`);
    if (initMessage.type !== CommunicationType.CTM_INITIALIZE) return ws.close();

    const initNow = Date.now();

    const { clusterId, clusterShards, timestamp } = initMessage.payload;
    clusterWebsockets.set(clusterId, ws);
    managerLogger.info(`Received cluster initialization message for cluster ${clusterId}, shards ${clusterShards.join(",")}.`);

    clusterList.set(clusterId, { clusterShards, clusterMemory: 0, startTimestamp: initNow, pingTimestamp: initNow });

    clusterConnectQueue.delete(clusterId);
    const readyToConnect = !clusterConnectQueue.size;
    clusterConnectQueue.add(clusterId);

    if (readyToConnect) managerLogger.info(`Cluster ${clusterId} has been approved for immediate connection with Discord.`);
    else managerLogger.info(`Cluster ${clusterId} has been queued for connecting with Discord.`);

    const initResponse: CommunicationMessage = {
      type: CommunicationType.MTC_NOTICE,
      payload: { timestampDifference: initNow - timestamp, readyToConnect },
    };
    ws.send(JSON.stringify(initResponse));

    ws.on("message", data => {
      const message = JSON.parse(data as unknown as string) as CommunicationMessage;
      managerLogger.http(`Received message from cluster ${clusterId}: ${JSON.stringify(message)}`);

      const now = Date.now();

      switch (message.type) {
        case CommunicationType.CTM_SHARD_CONNECTED: {
          const { shardId } = message.payload;
          shardList.set(shardId, {
            guilds: 0,
            users: 0,
            ping: 0,
            status: Status.Ready,
            readyTimestamp: now,
            updateTimestamp: now,
          });
          managerLogger.info(`Shard ${shardId} is connected.`);
          break;
        }
        case CommunicationType.CTM_CLIENT_READY: {
          const { shards, clusterMemory } = message.payload;
          for (const [shardId, shardData] of Object.entries(shards)) {
            shardList.set(Number(shardId), {
              ...shardData,
              readyTimestamp: now,
              updateTimestamp: now,
            });
          }
          clusterList.set(clusterId, { clusterShards, clusterMemory, startTimestamp: initNow, pingTimestamp: now });
          clusterRequestStatsIntervals.set(clusterId, setInterval(() => {
            const statsRequest: CommunicationMessage = {
              type: CommunicationType.MTC_REQUEST_STATS,
              payload: {},
            };
            ws.send(JSON.stringify(statsRequest));
            setTimeout(() => {
              const { pingTimestamp } = clusterList.get(clusterId) ?? { pingTimestamp: 0 };
              if (Date.now() - pingTimestamp > 60_000) {
                managerLogger.info(`Cluster ${clusterId} has not responded to stats requests in over a minute. Removing cluster and shards from list.`);
                clusterList.delete(clusterId);
                clusterShards.forEach(shard => {
                  shardList.delete(shard);
                });
              }
            }, 30000);
          }, 30000));
          clusterConnectQueue.delete(clusterId);
          managerLogger.info(`Cluster ${clusterId} is connected.`);
          if (clusterConnectQueue.size) {
            const nextClusterId = Array.from(clusterConnectQueue.values())[0]!;
            const nextClusterWs = clusterWebsockets.get(nextClusterId)!;
            const nextClusterRequest: CommunicationMessage = {
              type: CommunicationType.MTC_READY_TO_CONNECT,
              payload: {},
            };
            managerLogger.info(`Sending ready signal to cluster ${nextClusterId}.`);
            nextClusterWs.send(JSON.stringify(nextClusterRequest));
          }
          break;
        }
        case CommunicationType.CTM_POST_STATS: {
          const { shards, counts: clusterCount } = message.payload;
          addToWeeklyCount(clusterCount);
          for (const [shardId, newShardData] of Object.entries(shards)) {
            const oldShardData = shardList.get(Number(shardId));
            shardList.set(Number(shardId), {
              readyTimestamp: now,
              ...oldShardData,
              ...newShardData,
              updateTimestamp: now,
            });
          }
          const oldClusterData = clusterList.get(clusterId);
          if (oldClusterData) clusterList.set(clusterId, { ...oldClusterData, pingTimestamp: now });

          const postCombinedData: CommunicationMessage = {
            type: CommunicationType.MTC_DELIVER_ALL_STATS,
            payload: getCombinedData(),
          };
          ws.send(JSON.stringify(postCombinedData));
          break;
        }
        default: managerLogger.warn(`Received unknown websocket message: ${JSON.stringify(message)}`);
      }
    });

    ws.on("close", () => {
      managerLogger.info(`Websocket closed for cluster ${clusterId}`);

      const cluster = clusterList.get(clusterId);
      if (cluster) {
        for (const shard of cluster.clusterShards) shardList.delete(shard);
        clusterList.delete(clusterId);
        clusterWebsockets.delete(clusterId);
      }

      const interval = clusterRequestStatsIntervals.get(clusterId);
      if (interval) {
        clearInterval(interval);
        clusterRequestStatsIntervals.delete(clusterId);
      }
    });

    setInterval(() => {
      const presencePost: CommunicationMessage = {
        type: CommunicationType.MTC_POST_PRESENCE,
        payload: getPresence(),
      };
      ws.send(JSON.stringify(presencePost));
    }, 300000);
  });
});
