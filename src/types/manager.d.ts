import { ClusterData } from "./cluster";

export type ManagerStatus = {
  clusters: Array<ClusterData>;
  guilds: number;
  users: number;
  uptime: number;
  update: number;
}
