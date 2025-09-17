import type { Snowflake } from "discord.js";
import config from "../config";
import { Access } from "./models/Access";

export function checkGuildAccess(guildId: Snowflake): Promise<boolean> {
  return Access.findOne({ guildIds: guildId, expires: { $gt: new Date() } }).then(Boolean);
}

export async function filterGuildsWithAccess(guildIds: Snowflake[]): Promise<Snowflake[]> {
  const accessDocuments = await Access.find({ guildIds: { $in: guildIds } });
  const guildsWithAccess = guildIds.filter(guildId => accessDocuments.some(accessDocument => accessDocument.guildIds.includes(guildId)));

  // add ignored guilds from configuration if they are in the input list but not already included
  if (config.access?.ignoredGuilds) {
    for (const ignoredGuildId of config.access.ignoredGuilds) {
      if (guildIds.includes(ignoredGuildId) && !guildsWithAccess.includes(ignoredGuildId)) {
        guildsWithAccess.push(ignoredGuildId);
      }
    }
  }

  return guildsWithAccess;
}
