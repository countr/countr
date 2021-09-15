import Guild from "./models/Guild";
import { Guild as GuildModel } from "./models/Guild";

export const cache = new Map(), cacheQueue = new Map();

export const get = async (guildId: string, fromCache = true): Promise<GuildModel> => {
  const guild = cache.get(guildId);
  if (fromCache && guild) return guild; else {
    const queued = cacheQueue.get(guildId);
    if (queued) return await queued;

    const request: Promise<GuildModel> = new Promise((resolve, reject) => Guild.findOne({ guildId }, (err?: unknown, response?: GuildModel) => {
      if (err) return reject(err);

      const guild = response || new Guild({ guildId });

      cache.set(guildId, guild);
      cacheQueue.delete(guildId);
      return resolve(guild as GuildModel);
    }));
    cacheQueue.set(guildId, request);
    return await request;
  }
};

export const touch = (guildIds: Array<string>): Promise<void> =>
  Guild.find({ $or: guildIds.map(guildId => ({ guildId })) })
    .then(guilds => guildIds.forEach(guildId => cache.set(guildId, guilds.find(guild => guild.guildId === guildId) || new Guild({ guildId }))));

export const reset = (guildId: string): Promise<boolean> => Guild.deleteOne({ guildId }).then(() => cache.delete(guildId));