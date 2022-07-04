import type { CombinedData, ShardData } from "./manager/lists";
import type { PresenceData } from "discord.js";

// prefixed MTC = Manager to Cluster, prefixed CTM = Cluster to Manager
export enum CommunicationType {
  CTM_INITIALIZE,
  MTC_NOTICE,
  MTC_READY_TO_CONNECT,
  CTM_SHARD_CONNECTED,
  CTM_CLIENT_READY,
  MTC_REQUEST_STATS,
  CTM_POST_STATS,
  MTC_DELIVER_ALL_STATS,
  MTC_POST_PRESENCE,
}

interface Communication<T extends CommunicationType, P extends object> { type: T; payload: P }

export type CommunicationMessage =
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  | Communication<CommunicationType.CTM_INITIALIZE, ClusterInitializeData>
  | Communication<CommunicationType.MTC_NOTICE, ManagerNoticeData>
  | Communication<CommunicationType.MTC_READY_TO_CONNECT, NoPayload>
  | Communication<CommunicationType.CTM_SHARD_CONNECTED, ShardConnectedData>
  | Communication<CommunicationType.CTM_CLIENT_READY, ClusterStatsData>
  | Communication<CommunicationType.MTC_REQUEST_STATS, NoPayload>
  | Communication<CommunicationType.CTM_POST_STATS, ClusterStatsData>
  | Communication<CommunicationType.MTC_DELIVER_ALL_STATS, CombinedData>
  | Communication<CommunicationType.MTC_POST_PRESENCE, PresenceData>;

// type CTM_INITIALIZE
export interface ClusterInitializeData {
  clusterId: number;
  clusterShards: number[];
  timestamp: number;
}

// type MTC_NOTICE
export interface ManagerNoticeData {
  timestampDifference: number;
  readyToConnect: boolean;
}

// type CTM_SHARD_CONNECTED
export interface ShardConnectedData {
  shardId: number;
}

// type CTM_POST_STATS
export interface ClusterStatsData {
  shards: Record<number, ShardData>;
  counts: number;
  clusterMemory: number;
}

// no payload
type NoPayload = Record<string, never>;
