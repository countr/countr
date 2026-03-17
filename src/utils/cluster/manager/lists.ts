import type { Status } from "discord.js";
import { getWeeklyCount } from "./weeklyCount";

export interface ClusterData {
  clusterMemory: number;
  clusterShards: number[];
  pingTimestamp: number;
  startTimestamp: number;
}

export interface ShardData {
  guilds: number;
  ping: number;
  status: Status;
  users: number;
}

export interface ShardListedData extends ShardData {
  readyTimestamp: number;
  updateTimestamp: number;
}

export interface CombinedData {
  clusters: Record<string, ClusterData>;
  shards: Record<string, ShardListedData>;
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
