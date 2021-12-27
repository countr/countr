import * as access from "../database/access";
import { Client, Guild, WebhookClient } from "discord.js";
import config from "../config";
import { countrLogger } from "../utils/logger/countr";

const webhook = config.access.webhookLog ? new WebhookClient({ url: config.access.webhookLog }) : null;

export default (client: Client): void => {
  setInterval(
    () => access.findMultiple(client.guilds.cache.map(guild => guild.id))
      .then(guildsWithAccess => client.guilds.cache.filter(g => !guildsWithAccess.includes(g.id)).forEach(leave))
    , config.access.interval,
  );

  client.on("guildCreate", guild => {
    access.find(guild.id).then(access => access ? null : leave(guild));
  });
};

function leave(guild: Guild): Promise<Guild> {
  webhook?.send({
    content: `Server **${guild.name}** (\`${guild.id}\`) owned by <@${guild.ownerId}> does not have access to use \`${guild.client?.user?.tag}\` and has left the server`,
  });
  countrLogger.info(`Left server "${guild.name}" owned by ${guild.ownerId} for not having access`);
  return guild.leave();
}
