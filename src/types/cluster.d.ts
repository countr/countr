import { Status } from "discord.js";

export type Cluster = {
  id: number;
  shardIds: Array<number>;
  shardCount: number;
}

export type ClusterStatus = ClusterInfo & {
  status: Status;
  shards: Array<{
    id: number;
    ping: number;
    status: Status;
  }>;
  ping: number;
  uptime: number;
  guilds: number;
  users: number;
  loading: boolean;
  heartbeat: number; // last update
};

export type ClusterUpdate = {
  type: "cluster-update";
  payload: ClusterStatus;
}
