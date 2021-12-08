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
        memory: process.memoryUsage().heapUsed,
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
      totalShards: 0,
      totalGuilds: 0,
      totalUsers: 0,
      weeklyCount: 0,
      totalMemory: 0,
      lastUpdate: Date.now(),
    });
  } else if (!config.apiUri) {
    const memory = process.memoryUsage().heapUsed;
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
          memory,
          loading: false,
          uptime,
          update: Date.now(),
        },
      ],
      totalShards: config.cluster.shardCount,
      totalGuilds: client.guilds.cache.size,
      totalUsers: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
      weeklyCount: 0,
      totalMemory: memory,
      lastUpdate: Date.now(),
    });
  }

  return superagent.get(config.apiUri).then(json => json.body as ManagerStatus);
}

export function getPresence(client: Client): Promise<PresenceData> {
  if (!client.isReady()) return Promise.resolve({ status: "dnd" });

  if (!config.apiUri) {
    return Promise.resolve({
      status: "online",
      activity: {
        name: "the counting channel",
        type: "WATCHING",
      },
    });
  }

  return superagent.get(`${config.apiUri}/cluster/${config.cluster.id}/status`)
    .set("Authorization", config.client.token)
    .then(json => json.body as PresenceData);
}
