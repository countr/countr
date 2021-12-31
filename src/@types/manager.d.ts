import { ClusterData } from "./cluster";

export type ManagerStatus = {
  clusters: Array<ClusterData>;
  totalShards: number;
  totalGuilds: number;
  totalUsers: number;
  weeklyCount: number;
  totalMemory: number;
  lastUpdate: number;
}
