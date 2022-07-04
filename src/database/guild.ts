import { Guild } from "./models/Guild";
import type { GuildDocument } from "./models/Guild";
import type { Snowflake } from "discord.js";
import { databaseLogger } from "../utils/logger/database";

export const guildCache = new Map<Snowflake, GuildDocument>();
export const guildCacheQueue = new Map<Snowflake, Promise<GuildDocument>>();

export function getGuildDocument(guildId: Snowflake, fromCache = true): Promise<GuildDocument> {
  const guildFromCache = guildCache.get(guildId);
  if (fromCache && guildFromCache) return Promise.resolve(guildFromCache);

  const queued = guildCacheQueue.get(guildId);
  if (queued) return queued;

  const promise = new Promise<GuildDocument>(resolve => {
    void Guild.findOne({ guildId }).then(guildInDb => {
      const guild = guildInDb ?? new Guild({ guildId });

      guildCache.set(guildId, guild);
      guildCacheQueue.delete(guildId);
      return resolve(guild);
    });
  });

  guildCacheQueue.set(guildId, promise);
  return promise;
}

export function touchGuildDocument(guildIds: Snowflake[]): Promise<void> {
  return Guild.find({ $or: guildIds.map(guildId => ({ guildId })) })
    .then(guilds => guildIds.forEach(guildId => {
      guildCache.set(guildId, guilds.find(guild => guild.guildId === guildId) ?? new Guild({ guildId }));
    }));
}

export async function resetGuildDocument(guildId: Snowflake): Promise<boolean> {
  const guild = await getGuildDocument(guildId, false);
  void guild.remove().then(deletedGuild => databaseLogger.verbose(`Removed database of guild ${guildId}, contents were ${JSON.stringify(deletedGuild.toJSON())}`));
  return guildCache.delete(guildId) && guildCacheQueue.delete(guildId);
}
