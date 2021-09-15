import { Client, Options } from "discord.js";
import config from "../config";
import * as db from "./database";
import prepareGuild from "./handlers/prepareGuild";

const client = new Client({
  makeCache: Options.cacheWithLimits({
    MessageManager: 50,
    ...config.client.caches
  }),
  partials: [ "USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION" ],
  userAgentSuffix: [],
  presence: { status: "dnd" },
  intents: [ "GUILDS", "GUILD_MESSAGES" ]
});

let shard = "Shard N/A:", disabledGuilds: Set<string> | null = null;

client.once("ready", async () => {
  shard = `Shard ${client.shard.ids.join(",")}:`;
  console.log(shard, `Ready as ${client.user.tag}! Caching guilds...`);

  disabledGuilds = new Set(client.guilds.cache.map(g => g.id));  // cache guilds

  const cacheStart = Date.now();
  await db.guilds.touch(client.guilds.cache.map(g => g.id));
  console.log(shard, `${client.guilds.cache.size} guilds cached in ${Math.ceil((Date.now() - cacheStart) / 1000)}s. Processing available guilds...`);

  // process guilds
  let completed = 0;
  const processingStart = Date.now(), presenceInterval = setInterval(() => {
    const percentage = (completed / client.guilds.cache.size) * 100;
    client.user.setPresence({
      status: "idle",
      activities: [{
        type: "WATCHING",
        name: `${Math.round(percentage)}% ${"|".repeat(Math.round(percentage / 5))}`
      }]
    });
  }, 1000);
  await Promise.all(client.guilds.cache.map(async guild => {
    await prepareGuild(guild);
    disabledGuilds.delete(guild.id);
    completed++;
  }));
  clearInterval(presenceInterval);
  console.log(shard, `${client.guilds.cache.size} guilds processed in ${Math.ceil((Date.now() - processingStart) / 1000)}s.`);

  // finish up
  disabledGuilds = null;

  // presence
  updatePresence();
  setInterval(updatePresence, 1000 * 60);

  if (config.isPremium) {
    updateLiveboards();
    setInterval(updateLiveboards, 1000 * 60);
  }

  interactionsHandler(client).then(() => console.log(shard, "Now listening to interactions."));

  if (config.access.enabled) accessHandler(client);
});

const updatePresence = async () => client.user.setPresence({
  status: "online",
  activities: [{
    type: "WATCHING",
    name: `${(await db.global.get()).counts} counts this week!`
  }]
});

client.on("messageCreate", async message => {
  if (
    !message.guild ||
    disabledGuilds?.has(message.guild.id) ||
    message.author.bot ||
    message.type !== "DEFAULT"
  ) return;

  const guild = await db.guilds.get(message.guild.id), channel = guild.channels.get(message.channel.id);
  if (channel) return countingHandler(message, guild, channel);

  if (message.content.match(`^<@!?${client.user.id}> `)) return messageCommandHandler(message, guild);
  else if (message.content.match(`^<@!?${client.user.id}>`)) return message.reply({
    content: "hello"
  });
});

db.connection.then(() => client.login(config.client.token));