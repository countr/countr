import { Status } from "discord.js";

export type Cluster = {
  id: number;
  shards: Array<number>;
}

export type ClientCluster = Cluster & {
  shardCount: number;
}

export type ClusterStatus = {
  shards: Array<{
    id: number;
    ping: number;
    status: Status;
  }>;
  ping: number;
  status: Status;
  guilds: number;
  users: number;
  memory: number;
  loading: boolean;
  uptime: number;
  update: number; // last update
};

export type ClusterData = {
  cluster: Cluster;
} & ClusterStatus;

export type ClusterUpdate = {
  type: "cluster-update";
  payload: ClusterData & {
    newCounts: number;
  };
}
