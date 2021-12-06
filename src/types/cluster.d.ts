import { ClusterData } from "./manager";
import { Status } from "discord.js";

export type Cluster = {
  id: number;
  shards: Array<number>;
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
  loading: boolean;
  uptime: number;
  update: number; // last update
};

export type ClusterUpdate = {
  type: "cluster-update";
  payload: ClusterData;
}
