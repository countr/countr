import { Cluster, ClusterStatus } from "./cluster";

export type ClusterData = {
  cluster: Cluster;
} & ClusterStatus;

export type ManagerStatus = {
  clusters: Array<ClusterData>;
  guilds: number;
  users: number;
  uptime: number;
  update: number;
}
