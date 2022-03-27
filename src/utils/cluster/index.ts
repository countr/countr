import type { Status } from "discord.js";
import config from "../../config";
import superagent from "superagent";

export type Cluster = {
  id: number;
  shards: Array<number>;
}

export type ClusterData = {
  cluster: Cluster;
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
}

export type ClusterUpdate = {
  type: "cluster-update";
  payload: ClusterData & {
    newCounts: number;
  };
}

export function askForPermissionToInitialize(): Promise<boolean> {
  if (!config.apiUri) return Promise.resolve(true);
  return new Promise(resolve => {
    superagent
      .post(`${config.apiUri}/cluster/${config.cluster.id}/init`)
      .set("Authorization", config.client.token)
      .then(res => res.status === 200 ? resolve(true) : resolve(false))
      .catch(() => resolve(false));
  });
}

export function markClusterAsReady(): void {
  if (!config.apiUri) return;
  return void superagent
    .post(`${config.apiUri}/cluster/${config.cluster.id}/done`)
    .set("Authorization", config.client.token)
    .end();
}
