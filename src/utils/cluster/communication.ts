import type { PresenceData } from "discord.js";
import type { CombinedData, ShardData } from "./manager/lists";

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

interface Communication<T extends CommunicationType, P extends object> { payload: P; type: T }

export type CommunicationMessage =

  | Communication<CommunicationType.CTM_CLIENT_READY, ClusterStatsData>
  | Communication<CommunicationType.CTM_INITIALIZE, ClusterInitializeData>
  | Communication<CommunicationType.CTM_POST_STATS, ClusterStatsData>
  | Communication<CommunicationType.CTM_SHARD_CONNECTED, ShardConnectedData>
  | Communication<CommunicationType.MTC_DELIVER_ALL_STATS, CombinedData>
  | Communication<CommunicationType.MTC_NOTICE, ManagerNoticeData>
  | Communication<CommunicationType.MTC_POST_PRESENCE, PresenceData>
  | Communication<CommunicationType.MTC_READY_TO_CONNECT, NoPayload>
  | Communication<CommunicationType.MTC_REQUEST_STATS, NoPayload>;

// type CTM_INITIALIZE
export interface ClusterInitializeData {
  clusterId: number;
  clusterShards: number[];
  timestamp: number;
}

// type MTC_NOTICE
export interface ManagerNoticeData {
  readyToConnect: boolean;
  timestampDifference: number;
}

// type CTM_SHARD_CONNECTED
export interface ShardConnectedData {
  shardId: number;
}

// type CTM_POST_STATS
export interface ClusterStatsData {
  clusterMemory: number;
  counts: number;
  shards: Record<number, ShardData>;
}

// no payload
type NoPayload = Record<string, never>;
