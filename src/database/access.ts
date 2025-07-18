import type { Snowflake } from "discord.js";
import config from "../config";
import { Access } from "./models/Access";

export function checkGuildAccess(guildId: Snowflake): Promise<boolean> {
  return Access.findOne({ guildIds: guildId, expires: { $gt: new Date() } }).then(Boolean);
}

export async function filterGuildsWithAccess(guildIds: Snowflake[]): Promise<Snowflake[]> {
  const accessDocuments = await Access.find({ guildIds: { $in: guildIds } });
  const guildsWithAccess = guildIds.filter(guildId => accessDocuments.some(accessDocument => accessDocument.guildIds.includes(guildId)));

  // always include the main guild (config.guild) even if it doesn't have explicit access
  if (config.guild && guildIds.includes(config.guild) && !guildsWithAccess.includes(config.guild)) {
    guildsWithAccess.push(config.guild);
  }

  return guildsWithAccess;
}
