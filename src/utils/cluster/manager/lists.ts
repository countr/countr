import type { Status } from "discord.js";
import { getWeeklyCount } from "./weeklyCount";

export interface ClusterData {
  clusterShards: number[];
  clusterMemory: number;
  startTimestamp: number;
  pingTimestamp: number;
}

export interface ShardData {
  guilds: number;
  users: number;
  ping: number;
  status: Status;
}

export interface ShardListedData extends ShardData {
  readyTimestamp: number;
  updateTimestamp: number;
}

export interface CombinedData {
  shards: Record<string, ShardListedData>;
  clusters: Record<string, ClusterData>;
  weeklyCount: number;
}

export const shardList = new Map<number, ShardListedData>();
export const clusterList = new Map<number, ClusterData>();

export function getCombinedData(): CombinedData {
  return {
    shards: Object.fromEntries(shardList.entries()),
    clusters: Object.fromEntries(clusterList.entries()),
    weeklyCount: getWeeklyCount(),
  };
}
