import { Client } from "discord.js";
import { ClusterUpdate } from "../../types/cluster";
import { ManagerStatus } from "../../types/manager";
import config from "../../config";
import superagent from "superagent";

export function postStats(client: Client<true>, loading: boolean): void {
  if (!config.apiUri) return;
  const now = Date.now();
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
        uptime: now - client.uptime,
        update: now,
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
    const now = Date.now();
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
          uptime: now - client.uptime,
          update: now,
        },
      ],
      totalShards: config.cluster.shardCount,
      totalGuilds: client.guilds.cache.size,
      totalUsers: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
      weeklyCount: 0,
      totalMemory: memory,
      lastUpdate: now,
    });
  }

  return superagent.get(config.apiUri).then(json => json.body as ManagerStatus);
}
