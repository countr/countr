import type { Guild } from "discord.js";
import type { CountingChannelAllowedChannelType } from "../../constants/discord";
import { getGuildDocument } from "../../database";
import recoverHandler from "./recover";
import timeoutsHandler from "./timeouts";

export default async function prepareGuild(guild: Guild): Promise<void> {
  const db = await getGuildDocument(guild.id);

  const result = await Promise.all(Array.from(db.channels).map(([channelId, { count: { messageId }, modules, timeoutRole, timeouts }]) => {
    const channel = (guild.channels.cache.get(channelId) ?? null) as CountingChannelAllowedChannelType | null;
    if (!channel) return false;

    const promises: Array<Promise<boolean>> = [];
    if (modules.includes("recover") && messageId) promises.push(recoverHandler(channel, messageId));
    if (timeoutRole) promises.push(timeoutsHandler(guild, timeoutRole, timeouts, () => db.safeSave()));

    return Promise.all(promises).then(results => results.find(Boolean));
  }));

  if (result.find(Boolean)) db.safeSave();
}
