import * as guilds from "./database/guilds";
import { Client, Options } from "discord.js";
import { askForPermissionToInitialize, markClusterAsReady } from "./utils/cluster";
import accessHandler from "./handlers/access";
import config from "./config";
import { connection } from "./database";
import countingHandler from "./handlers/counting";
import { countrLogger } from "./utils/logger/countr";
import { discordLogger } from "./utils/logger/discord";
import { getPresence } from "./utils/cluster/presence";
import interactionsHandler from "./handlers/interactions";
import messageCommandHandler from "./handlers/messageCommands";
import { postStats } from "./utils/cluster/stats";
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
  shards: config.cluster.shards,
  shardCount: config.cluster.shardCount,
});

let disabledGuilds = new Set();

client.once("ready", async client => {
  countrLogger.info(`Ready as ${client.user.tag} on shards ${config.cluster.shards.join(", ")}! Caching guilds...`);
  markClusterAsReady();

  // stats
  setInterval(() => postStats(client, Boolean(disabledGuilds.size)), 10000);

  // prepare guilds
  if (client.guilds.cache.size) {
    disabledGuilds = new Set(client.guilds.cache.map(g => g.id)); // cache guilds

    const cacheStart = Date.now();
    await guilds.touch(client.guilds.cache.map(g => g.id));
    countrLogger.info(`${client.guilds.cache.size} guilds cached in ${Math.ceil((Date.now() - cacheStart) / 1000)}s. Processing available guilds...`);

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
    countrLogger.info(`${client.guilds.cache.size} guilds processed in ${Math.ceil((Date.now() - processingStart) / 1000)}s.`);

    // finish up
    disabledGuilds = new Set();
  } else countrLogger.warn("Add the bot with this link: https://todo");

  // presence
  updatePresence();
  setInterval(updatePresence, 1000 * 60);

  // premium
  if (config.isPremium) {
    updateLiveboards(client);
    setInterval(() => updateLiveboards(client), 1000 * 60);
  }

  // interactions
  interactionsHandler(client).then(() => countrLogger.info("Now listening to interactions."));

  // access handler
  if (config.access.enabled) accessHandler(client);
});

function updatePresence() {
  return getPresence(client).then(presence => client.user?.setPresence(presence));
}

client.on("messageCreate", async message => {
  if (
    !message.guildId ||
    disabledGuilds?.has(message.guildId) ||
    message.author.bot ||
    message.type !== "DEFAULT"
  ) return;

  const document = await guilds.get(message.guildId);

  const channel = document.channels.get(message.channelId);
  if (channel) return void countingHandler(message, document, channel);

  if (message.content.match(`^<@!?${client.user?.id}> `)) return void messageCommandHandler(message, document);

  if (message.content.match(`^<@!?${client.user?.id}>`)) {
    return void message.reply({
      content: "hello",
    });
  }
});

client
  .on("debug", info => void discordLogger.debug(info))
  .on("error", error => void discordLogger.error(`Cluster errored. ${JSON.stringify({ ...error })}`))
  .on("rateLimit", rateLimitData => void discordLogger.warn(`Rate limit ${JSON.stringify(rateLimitData)}`))
  .on("ready", () => void discordLogger.info("All shards have been connected."))
  .on("shardDisconnect", (event, id) => void discordLogger.warn(`Shard ${id} disconnected. ${JSON.stringify({ ...event })}`))
  .on("shardError", (error, id) => void discordLogger.error(`Shard ${id} errored. ${JSON.stringify({ ...error })}`))
  .on("shardReady", id => void discordLogger.info(`Shard ${id} is ready.`))
  .on("shardReconnecting", id => void discordLogger.warn(`Shard ${id} is reconnecting.`))
  .on("shardResume", (id, replayed) => void discordLogger.info(`Shard ${id} resumed. ${replayed} events replayed.`))
  .on("warn", info => void discordLogger.warn(info));

Promise.all([
  connection,
  new Promise(resolve => {
    const timeout = setInterval(() => askForPermissionToInitialize().then(greenLight => {
      if (greenLight) {
        resolve(void 0);
        clearInterval(timeout);
        countrLogger.info("Green light received. Logging in...");
      }
    }), 5000);
  }),
]).then(() => client.login(config.client.token));

setInterval(() => postStats(client, Boolean(disabledGuilds.size)), 10000);

process.on("unhandledRejection", error => countrLogger.error(`Unhandled rejection: ${JSON.stringify(error)}`));
