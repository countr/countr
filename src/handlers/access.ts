import { Client, WebhookClient, Guild } from "discord.js";
import { access } from "../database";
import config from "../../config";

const webhook = config.access.webhook_log ? new WebhookClient({ url: config.access.webhook_log }) : null;

export default async (client: Client): Promise<void> => {
  setInterval(() => access.findMultiple(client.guilds.cache.map(guild => guild.id))
    .then(guildsWithAccess => client.guilds.cache.filter(g => !guildsWithAccess.includes(g.id)).forEach(leave))
  , config.access.interval);

  client.on("guildCreate", guild => {
    access.find(guild.id).then(access => access ? null : leave(guild));
  });
};

function leave(guild: Guild): Promise<Guild> {
  webhook?.send({
    content: `Server **${guild.name}** (\`${guild.id}\`) owned by <@${guild.ownerId}> does not have access to use \`${guild.client?.user?.tag}\` and has left the server`
  });
  return guild.leave();
}