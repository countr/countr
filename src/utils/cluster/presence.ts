import type { Client, PresenceData } from "discord.js";
import config from "../../config";
import superagent from "superagent";

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
