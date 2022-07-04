import { Access } from "./models/Access";
import type { Snowflake } from "discord.js";

export function checkGuildAccess(guildId: Snowflake): Promise<boolean> {
  return Access.findOne({ servers: guildId, expires: { $gt: new Date() }}).then(Boolean);
}

export async function filterGuildsWithAccess(guildIds: Snowflake[]): Promise<Snowflake[]> {
  const accessDocuments = await Access.find({ servers: { $in: guildIds }, expires: { $gt: new Date() }});
  return guildIds.filter(guildId => accessDocuments.some(accessDocument => accessDocument.servers.includes(guildId)));
}
