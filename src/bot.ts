import * as global from "./database/global";
import * as guilds from "./database/guilds";
import { Client, Options } from "discord.js";
import { askForPermissionToInitialize, markClusterAsReady } from "./manager/initializeCluster";
import accessHandler from "./handlers/access";
import config from "./config";
import { connection } from "./database";
import countingHandler from "./handlers/counting";
import interactionsHandler from "./handlers/interactions";
import messageCommandHandler from "./handlers/messageCommands";
import { postStats } from "./manager/stats";
import prepareGuild from "./handlers/prepareGuild";
import updateLiveboards from "./handlers/liveboard";

const client = new Client({
  makeCache: Options.cacheWithLimits({
    ...config.client.caches,
  }),
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
  userAgentSuffix: [],
  presence: { status: "dnd" },
  intents: ["GUILDS", "GUILD_MESSAGES"],
  shards: config.cluster.shardIds,
  shardCount: config.cluster.shardCount,
});

const shard = `C${config.cluster.id};S${config.cluster.shardIds.join(",")}:`;
let disabledGuilds = new Set();

client.once("ready", async client => {
  console.log(shard, `Ready as ${client.user.tag}! Caching guilds...`);
  markClusterAsReady();

  // prepare guilds
  if (client.guilds.cache.size) {
    disabledGuilds = new Set(client.guilds.cache.map(g => g.id)); // cache guilds

    const cacheStart = Date.now();
    await guilds.touch(client.guilds.cache.map(g => g.id));
    console.log(shard, `${client.guilds.cache.size} guilds cached in ${Math.ceil((Date.now() - cacheStart) / 1000)}s. Processing available guilds...`);

    // process guilds
    let completed = 0;
    const processingStart = Date.now(), presenceInterval = setInterval(() => {
      const percentage = completed / client.guilds.cache.size * 100;
      client.user.setPresence({
        status: "idle",
        activities: [
          {
            type: "WATCHING",
            name: `${Math.round(percentage)}% ${"|".repeat(Math.round(percentage / 5))}`,
          },
        ],
      });
    }, 1000);
    await Promise.all(client.guilds.cache.map(async guild => {
      await prepareGuild(guild);
      disabledGuilds.delete(guild.id);
      completed += 1;
    }));
    clearInterval(presenceInterval);
    console.log(shard, `${client.guilds.cache.size} guilds processed in ${Math.ceil((Date.now() - processingStart) / 1000)}s.`);

    // finish up
    disabledGuilds = new Set();
  } else console.log("Add the bot with this link: https://todo");

  // presence
  updatePresence();
  setInterval(updatePresence, 1000 * 60);

  // premium
  if (config.isPremium) {
    updateLiveboards(client);
    setInterval(() => updateLiveboards(client), 1000 * 60);
  }

  // interactions
  interactionsHandler(client).then(() => console.log(shard, "Now listening to interactions."));

  // access handler
  if (config.access.enabled) accessHandler(client);
});

async function updatePresence() {
  client.user?.setPresence({
    status: "online",
    activities: [
      {
        type: "WATCHING",
        name: `${(await global.get()).counts} counts this week!`,
      },
    ],
  });
}

client.on("messageCreate", async message => {
  if (
    !client.user ||
    !message.guild ||
    disabledGuilds?.has(message.guild.id) ||
    message.author.bot ||
    message.type !== "DEFAULT"
  ) return;

  const document = await guilds.get(message.guild.id);
  if (document.channels.has(message.channel.id)) countingHandler(message, document);

  else if (message.content.match(`^<@!?${client.user.id}> `)) messageCommandHandler(message, document);
  else if (message.content.match(`^<@!?${client.user.id}>`)) {
    message.reply({
      content: "hello",
    });
  }
});

client
  .on("error", err => console.log(shard, "Client error.", err))
  .on("rateLimit", rateLimitInfo => console.log(shard, "Rate limited.", JSON.stringify(rateLimitInfo)))
  .on("shardReady", id => console.log(shard, `Shard ${id} ready.`))
  .on("shardDisconnected", closeEvent => console.log(shard, "Disconnected.", closeEvent))
  .on("shardError", err => console.log(shard, "Error.", err))
  .on("shardReconnecting", () => console.log(shard, "Reconnecting."))
  .on("shardResume", (_, replayedEvents) => console.log(shard, `Resumed. ${replayedEvents} replayed events.`))
  .on("warn", info => console.log(shard, "Warning.", info));

Promise.all([
  connection,
  new Promise(resolve => {
    const timeout = setInterval(() => askForPermissionToInitialize().then(greenLight => {
      if (greenLight) {
        resolve(void 0);
        clearInterval(timeout);
      }
    }), 5000);
  }),
]).then(() => client.login(config.client.token));

setInterval(() => postStats(client, Boolean(disabledGuilds.size)), 10000);

process.on("unhandledRejection", console.log);
