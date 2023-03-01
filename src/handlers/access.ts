import type { Client, Guild } from "discord.js";
import { WebhookClient } from "discord.js";
import config from "../config";
import { filterGuildsWithAccess } from "../database";
import mainLogger from "../utils/logger/main";

const webhook = config.access?.webhookLog ? new WebhookClient({ url: config.access.webhookLog }) : null;

export default function handleAccess(client: Client<true>): void {
  if (!config.access) return;

  setInterval(() => void filterGuildsWithAccess(client.guilds.cache.map(guild => guild.id)).then(guildsWithAccess => {
    const guildsToLeave = client.guilds.cache.filter(guild => !guildsWithAccess.includes(guild.id));
    guildsToLeave.forEach(leave);
  }), config.access.interval);
}

function leave(guild: Guild): void {
  void webhook?.send(`Server **${guild.name}** (\`${guild.id}\`) owned by <@${guild.ownerId}> does not have access to use Countr and I've therefore purposefully left the server.`);
  mainLogger.info(`Left server "${guild.name}" (${guild.id}) for not having sufficient access.`);
  return void guild.leave();
}
