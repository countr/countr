import { Client } from "discord.js";
import { ClusterData } from "../types/flows/cluster";
import HybridSharding from "discord-hybrid-sharding";
import config from "../config";

const data = (HybridSharding.data as unknown || {}) as ClusterData;

export const SHARD_LIST = data.SHARD_LIST || [];
export const TOTAL_SHARDS = data.TOTAL_SHARDS || 0;

export function getCluster(client: Client): HybridSharding.Client {
  return new HybridSharding.Client(client, true);
}

export function getClusterManager(): HybridSharding.Manager {
  return new HybridSharding.Manager(`${__dirname}/../bot.js`, {
    totalShards: config.client.shards,
    totalClusters: config.client.clusters,
    token: config.client.token,
    mode: "worker",
    keepAlive: {
      interval: 5000,
      maxMissedHeartbeats: 3,
      maxClusterRestarts: 2,
    },
    respawn: true,
    usev13: true,
  });
}
