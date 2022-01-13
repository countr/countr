import * as guilds from "../../database/guilds";
import { Guild, GuildMember, TextChannel, ThreadChannel } from "discord.js";
import { CountingChannel } from "../../database/models/Guild";
import recoverHandler from "./recover";
import timeoutsHandler from "./timeouts";

export default async (guild: Guild): Promise<void> => {
  const db = await guilds.get(guild.id);

  await queueFetch([
    ...Array.from(db.channels.values()).map(channel => Array.from(channel.timeouts.keys())).flat(),
    // room for more if needed
  ], guild);

  await Promise.all(Array.from(db.channels as Map<string, CountingChannel>).map(([id, { count: { messageId }, modules, timeoutRole, timeouts }]) => {
    const channel = guild.channels.cache.get(id) as TextChannel | ThreadChannel;
    if (channel) {
      const promises: Array<Promise<boolean>> = [];
      if (modules.includes("recover") && messageId) promises.push(recoverHandler(channel, messageId));
      if (timeoutRole) promises.push(timeoutsHandler(channel.guild, timeoutRole, timeouts, db.safeSave));

      return Promise.all(promises).then(responses => responses.find(Boolean) ? db.safeSave() : null); // if any of the promises return true, save the guild
    } return void 0;
  }));
};

const queue: Array<() => Promise<void>> = [];
let current: Promise<void> | null = null;

function queueFetch(userIds: Array<string>, guild: Guild): Promise<Array<GuildMember>> {
  return new Promise(resolveFunction => {
    queue.push(() => new Promise(resolveQueue => {
      fetchAll(userIds, guild).then(members => {
        current = null;
        resolveQueue();
        resolveFunction(members);
      });
    }));

    if (!current) {
      (async () => { // we need async here to await the current
        while (queue.length) {
          current = queue.shift()?.() || null;
          await current;
        }
      })();
    }
  });
}

async function fetchAll(userIds: Array<string>, guild: Guild): Promise<Array<GuildMember>> {
  if (!userIds.length) return [];
  const members: Array<GuildMember> = [];

  // split userIds in chunks of 100 -- copilot made this, idk if it'll work yet
  const chunks = userIds.reduce<Array<Array<string>>>((acc, userId, index) => {
    if (index % 100 === 0) acc.push([]);
    acc[acc.length - 1].push(userId);
    return acc;
  }, []);

  // fetch all chunks
  for (const chunk of chunks) {
    const fetched = await guild.members.fetch({ user: chunk });
    members.push(...Array.from(fetched.values()));
  }

  return members;
}
