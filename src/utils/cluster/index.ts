import type { Client } from "discord.js";
import { WebSocket } from "ws";
import type { CommunicationMessage } from "./communication";
import type { CombinedData, ShardData } from "./manager/lists";
import config from "../../config";
import mainLogger from "../logger/main";
import { CommunicationType } from "./communication";

let allStats: CombinedData | null = null;
export function getAllStats(): typeof allStats {
  return allStats;
}

let counts = 0;
export function addToCount(count: number): void {
  counts += count;
}

export function initializeWebsocket(client: Client): WebSocket {
  const ws = new WebSocket(config.websocket.uri);
  ws.on("message", data => {
    const message = JSON.parse(data as unknown as string) as CommunicationMessage;
    mainLogger.http(`Received message: ${JSON.stringify(message)}`);

    switch (message.type) {
      case CommunicationType.MTC_NOTICE: {
        const { readyToConnect } = message.payload;
        if (readyToConnect) {
          mainLogger.info("Manager approved cluster immediately. Connecting cluster to Discord...");
          void client.login(config.client.token);
        } else mainLogger.info("Waiting for manager to approve cluster connection...");
        break;
      }
      case CommunicationType.MTC_READY_TO_CONNECT: {
        mainLogger.info("Manager approved cluster. Connecting cluster to Discord...");
        void client.login(config.client.token);
        break;
      }
      case CommunicationType.MTC_REQUEST_STATS: {
        const shards: Record<number, ShardData> = {};
        for (const shard of Array.from(client.ws.shards.values())) {
          const guilds = client.guilds.cache.filter(guild => guild.shardId === shard.id);
          shards[shard.id] = {
            guilds: guilds.size,
            users: guilds.reduce((users, guild) => users + guild.memberCount, 0),
            ping: shard.ping,
            status: shard.status,
          };
        }

        const clusterMemory = process.memoryUsage().heapUsed;
        const statsResponse: CommunicationMessage = {
          type: CommunicationType.CTM_POST_STATS,
          payload: { shards, clusterMemory, counts },
        };
        ws.send(JSON.stringify(statsResponse));
        counts = 0;
        break;
      }
      case CommunicationType.MTC_DELIVER_ALL_STATS: {
        allStats = message.payload;
        break;
      }
      case CommunicationType.MTC_POST_PRESENCE: {
        const presence = message.payload;
        client.user?.setPresence(presence);
        break;
      }
      // unreachable code
      case CommunicationType.CTM_INITIALIZE:
      case CommunicationType.CTM_SHARD_CONNECTED:
      case CommunicationType.CTM_CLIENT_READY:
      case CommunicationType.CTM_POST_STATS:
      default: mainLogger.warn(`Received unknown websocket message: ${JSON.stringify(message)}`);
    }
  });

  ws.on("open", () => {
    void mainLogger.http("Connected to websocket server.");
    ws.on("close", () => {
      mainLogger.info("Websocket closed, destroying Discord client and restarting...");
      void client.destroy().then(() => process.exit(0));
    });
  });

  client
    .on("shardReady", shardId => {
      const shardConnected: CommunicationMessage = {
        type: CommunicationType.CTM_SHARD_CONNECTED,
        payload: { shardId },
      };
      ws.send(JSON.stringify(shardConnected));
    })
    .on("ready", () => {
      const shards: Record<number, ShardData> = {};
      for (const shard of Array.from(client.ws.shards.values())) {
        const guilds = client.guilds.cache.filter(guild => guild.shardId === shard.id);
        shards[shard.id] = {
          guilds: guilds.size,
          users: guilds.reduce((users, guild) => users + guild.memberCount, 0),
          ping: shard.ping,
          status: shard.status,
        };
      }

      const clusterMemory = process.memoryUsage().heapUsed;
      const clientReady: CommunicationMessage = {
        type: CommunicationType.CTM_CLIENT_READY,
        payload: { shards, clusterMemory, counts },
      };
      ws.send(JSON.stringify(clientReady));
      counts = 0;
    });

  return ws;
}
