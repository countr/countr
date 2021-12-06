import { Client, PresenceData } from "discord.js";
import { ClusterUpdate } from "../types/cluster";
import { ManagerStatus } from "../types/manager";
import config from "../config";
import superagent from "superagent";

const uptime = Date.now();

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

export function postStats(client: Client<true>, loading: boolean): void {
  if (!config.apiUri) return;
  return void superagent
    .post(`${config.apiUri}/cluster/${config.cluster.id}/stats`)
    .send({
      type: "cluster-update",
      payload: {
        cluster: config.cluster,
        shards: client.ws.shards.map(s => ({
          id: s.id,
          ping: s.ping,
          status: s.status,
        })),
        ping: client.ws.ping,
        status: client.ws.status,
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
        loading,
        uptime,
        update: Date.now(),
      },
    } as ClusterUpdate)
    .set("Content-Type", "application/json")
    .set("Authorization", config.client.token)
    .end();
}

export function getManagerStats(client: Client): Promise<ManagerStatus> {
  if (!client.isReady()) {
    return Promise.resolve({
      clusters: [],
      guilds: 0,
      users: 0,
      uptime,
      update: Date.now(),
    });
  } else if (!config.apiUri) {
    return Promise.resolve({
      clusters: [
        {
          cluster: config.cluster,
          shards: client.ws.shards.map(s => ({
            id: s.id,
            ping: s.ping,
            status: s.status,
          })),
          ping: client.ws.ping,
          status: client.ws.status,
          guilds: client.guilds.cache.size,
          users: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
          loading: false,
          uptime,
          update: Date.now(),
        },
      ],
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
      uptime,
      update: Date.now(),
    });
  }

  return superagent.get(config.apiUri).then(json => json.body as ManagerStatus);
}
