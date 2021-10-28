import { Guild, TextChannel, ThreadChannel } from "discord.js";
import { guilds } from "../../database";
import { CountingChannel } from "../../database/models/Guild";
import recoverHandler from "./recover";
import timeoutsHandler from "./timeouts";

export default async (guild: Guild): Promise<void> => {
  const db = await guilds.get(guild.id);

  await Promise.all(Array.from(db.channels as Map<string, CountingChannel>).map(async ([ id, { count: { messageId }, modules, timeoutRole, timeouts } ]) => {
    const channel = guild.channels.cache.get(id) as TextChannel | ThreadChannel;
    if (channel) {
      const promises: Array<Promise<boolean>> = [];
      if (modules.includes("recover") && messageId) promises.push(recoverHandler(channel, messageId));
      if (timeoutRole) promises.push(timeoutsHandler(channel.guild, timeoutRole, timeouts, db.safeSave));

      return await Promise.all(promises).then(responses => responses.find(Boolean) ? db.safeSave() : null); // if any of the promises return true, save the guild
    } else return;
  }));
};
