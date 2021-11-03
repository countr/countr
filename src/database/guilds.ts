import Guild, { GuildDocument } from "./models/Guild";

export const cache: Map<string, GuildDocument> = new Map(), cacheQueue = new Map();

export const get = (guildId: string, fromCache = true): Promise<GuildDocument> => {
  const guild = cache.get(guildId);
  if (fromCache && guild) return Promise.resolve(guild);
  const queued = cacheQueue.get(guildId);
  if (queued) return queued;

  const request: Promise<GuildDocument> = new Promise((resolve, reject) => {
    Guild.findOne({ guildId }).then(guildInDb => {
      const guild = guildInDb || new Guild({ guildId });

      cache.set(guildId, guild);
      cacheQueue.delete(guildId);
      return resolve(guild);
    }).catch(reject);
  });
  cacheQueue.set(guildId, request);
  return request;
};

export const touch = (guildIds: Array<string>): Promise<void> => Guild.find({ $or: guildIds.map(guildId => ({ guildId })) })
  .then(guilds => guildIds.forEach(guildId => cache.set(guildId, guilds.find(guild => guild.guildId === guildId) || new Guild({ guildId }))));

export const reset = (guildId: string): Promise<boolean> => Guild.deleteOne({ guildId }).then(() => cache.delete(guildId));
