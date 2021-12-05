import { ClusterStatus } from "./cluster";

export type ManagerStatus = {
  clusters: Array<ClusterStatus>;
  guilds: number;
  users: number;
}
