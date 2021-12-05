import { Client } from "discord.js";
import { ClusterUpdate } from "../types/cluster";
import { ManagerStatus } from "../types/manager";
import config from "../config";
import superagent from "superagent";

export function postStats(client: Client<true>, loading: boolean): void {
  if (!config.managerUri) return;
  return void superagent
    .post(config.managerUri)
    .send({
      type: "cluster-update",
      payload: {
        ...config.cluster,
        status: client.ws.status,
        shards: client.ws.shards.map(s => ({
          id: s.id,
          ping: s.ping,
          status: s.status,
        })),
        ping: client.ws.ping,
        uptime: client.uptime,
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
        loading,
        heartbeat: Date.now(),
      },
    } as ClusterUpdate)
    .set("Content-Type", "application/json")
    .set("Authorization", config.client.token);
}

export function getStats(client: Client): Promise<ManagerStatus> {
  if (!client.isReady()) {
    return Promise.resolve({
      clusters: [],
      guilds: 0,
      users: 0,
    });
  } else if (!config.managerUri) {
    return Promise.resolve({
      clusters: [
        {
          ...config.cluster,
          status: client.ws.status,
          shards: client.ws.shards.map(s => ({
            id: s.id,
            ping: s.ping,
            status: s.status,
          })),
          ping: client.ws.ping,
          uptime: client.uptime,
          guilds: client.guilds.cache.size,
          users: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
          loading: false,
        },
      ],
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
    });
  }

  return fetch(config.managerUri).then(res => res.json()).then(json => json as ManagerStatus);
}
