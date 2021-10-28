import { Client, Options } from "discord.js";
import config from "./config";
import * as db from "./database";
import prepareGuild from "./handlers/prepareGuild";
import updateLiveboards from "./handlers/liveboard";
import accessHandler from "./handlers/access";
import interactionsHandler from "./handlers/interactions";
import countingHandler from "./handlers/counting";
import messageCommandHandler from "./handlers/messageCommands";

const client = new Client({
  makeCache: Options.cacheWithLimits({
    ...config.client.caches
  }),
  partials: [ "USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION" ],
  userAgentSuffix: [],
  presence: { status: "dnd" },
  intents: [ "GUILDS", "GUILD_MESSAGES" ]
});

let shard = "Shard N/A:", disabledGuilds = new Set();

client.once("ready", async client => {
  shard = `Shard ${client.shard?.ids.join(",")}:`;
  console.log(shard, `Ready as ${client.user.tag}! Caching guilds...`);

  if (client.guilds.cache.size) {
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
    disabledGuilds = new Set();
  } else console.log("Add the bot with this link: https://todo");

  // presence
  updatePresence();
  setInterval(updatePresence, 1000 * 60);

  if (config.isPremium) {
    updateLiveboards(client);
    setInterval(() => updateLiveboards(client), 1000 * 60);
  }

  interactionsHandler(client).then(() => console.log(shard, "Now listening to interactions."));

  if (config.access.enabled) accessHandler(client);
});

const updatePresence = async () => client?.user?.setPresence({
  status: "online",
  activities: [{
    type: "WATCHING",
    name: `${(await db.global.get()).counts} counts this week!`
  }]
});

client.on("messageCreate", async message => {
  if (
    !client?.user ||
    !message.guild ||
    disabledGuilds?.has(message.guild.id) ||
    message.author.bot ||
    message.type !== "DEFAULT"
  ) return;

  const document = await db.guilds.get(message.guild.id);
  if (document.channels.has(message.channel.id)) countingHandler(message, document);

  else if (message.content.match(`^<@!?${client.user.id}> `)) messageCommandHandler(message, document);
  else if (message.content.match(`^<@!?${client.user.id}>`)) message.reply({
    content: "hello"
  });
});

db.connection.then(() => client.login(config.client.token));

process.on("unhandledRejection", console.log);