import type { Message, PartialMessage, Snowflake } from "discord.js";
import { Client, IntentsBitField, MessageType, Options, Partials } from "discord.js";
import { inspect, promisify } from "util";
import type { CommunicationMessage } from "./utils/cluster/communication";
import config from "./config";
import { inviteUrl } from "./constants/links";
import numberSystems from "./constants/numberSystems";
import { connection, getGuildDocument, touchGuildDocument } from "./database";
import handleAccess from "./handlers/access";
import handleAutomaticTokenReset from "./handlers/automaticTokenReset";
import countingHandler from "./handlers/counting";
import checkRegex from "./handlers/counting/regex";
import replaceUpdatedOrDeletedMessage from "./handlers/counting/replacement";
import handleInteractions, { registerCommands } from "./handlers/interactions";
import handleLiveboard from "./handlers/liveboard";
import mentionCommandHandler from "./handlers/mentionCommands";
import prepareGuild from "./handlers/prepareGuilds";
import { initializeWebsocket } from "./utils/cluster";
import { CommunicationType } from "./utils/cluster/communication";
import discordLogger from "./utils/logger/discord";
import mainLogger from "./utils/logger/main";
import { msToHumanSeconds } from "./utils/time";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.MessageContent,
  ],
  makeCache: Options.cacheWithLimits(config.client.caches),
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
  presence: { status: "dnd" },
  rest: { userAgentAppendix: "Countr (countr.xyz)" },
  shards: config.cluster.shards,
  shardCount: config.cluster.shardCount,
});

let disabledGuilds = new Set<Snowflake>();
const sleep = promisify(setTimeout);

client.once("ready", trueClient => void (async () => {
  await sleep(5000);
  mainLogger.info(`Ready as @${trueClient.user.username} on shards ${trueClient.ws.shards.map(shard => shard.id).join(",") || "0"}. Caching guilds.`);
  if (config.cluster.id === 0) registerCommands(trueClient);

  // perpare guilds
  if (client.guilds.cache.size) {
    disabledGuilds = new Set(client.guilds.cache.map(guild => guild.id));

    // cache guilds
    const cacheStart = Date.now();
    const guildIds = Array.from(disabledGuilds.values());
    for (let i = 0; i < guildIds.length; i += 500) {
      await touchGuildDocument(guildIds.slice(i, i + 1000));
      await sleep(1000);
    }
    mainLogger.info(`Cached ${disabledGuilds.size} guilds in ${msToHumanSeconds(Date.now() - cacheStart)}. Processing available guilds.`);

    // process guilds
    const processingStart = Date.now();
    await Promise.all(client.guilds.cache.map(async guild => new Promise(resolve => {
      void Promise.race([prepareGuild(guild).then(() => false), sleep(30_000).then(() => true)])
        .then(timeout => {
          if (timeout) mainLogger.warn(`Timed out when preparing guild ${guild.id} (${guild.name}).`);
          resolve(void disabledGuilds.delete(guild.id));
        })
        .catch((err: unknown) => {
          mainLogger.warn(`Failed to prepare guild ${guild.id} (${guild.name}): ${inspect(err)}`);
          resolve(void disabledGuilds.delete(guild.id));
        });
    })));
    mainLogger.info(`Processed guilds in ${msToHumanSeconds(Date.now() - processingStart)}. (missing: ${disabledGuilds.size})`);

    // finish up
    disabledGuilds = new Set();
  } else mainLogger.warn(`Add the bot with this link: ${inviteUrl(trueClient)}`);

  // client handlers
  handleAccess(trueClient);
  handleAutomaticTokenReset(trueClient);
  handleInteractions(trueClient);
  handleLiveboard(trueClient);
})());

client.on("messageCreate", message => void (async () => {
  if (
    !message.inGuild() ||
    disabledGuilds.has(message.guildId) ||
    message.author.bot ||
    message.type !== MessageType.Default &&
    message.type !== MessageType.Reply
  ) return;

  const document = await getGuildDocument(message.guildId);
  const countingChannel = document.channels.get(message.channelId);
  if (countingChannel) return countingHandler(message, document, countingChannel);

  if (RegExp(`^<@!?${client.user!.id}>`, "u").exec(message.content)) return mentionCommandHandler(message, document);
})());

client.on("messageUpdate", (_, _potentialPartialMessage) => void (async () => {
  const potentialPartialMessage = _potentialPartialMessage as Message<true> | PartialMessage;
  if (!potentialPartialMessage.guildId || disabledGuilds.has(potentialPartialMessage.guildId)) return;

  const document = await getGuildDocument(potentialPartialMessage.guildId);

  const countingChannel = document.channels.get(potentialPartialMessage.channelId);
  if (countingChannel?.count.messageId !== potentialPartialMessage.id) {
    if (potentialPartialMessage.content && RegExp(`^<@!?${client.user!.id}>`, "u").exec(potentialPartialMessage.content)) {
      const message = potentialPartialMessage.partial ? await potentialPartialMessage.fetch() : potentialPartialMessage;
      if (message.inGuild()) mentionCommandHandler(message, document);
    }
    return;
  }

  const message = potentialPartialMessage.partial ? await potentialPartialMessage.fetch() : potentialPartialMessage;

  // convert number and test if it's still a valid number
  const input = countingChannel.modules.includes("talking") ? message.content.split(/<|:| /u)[0]! : message.content;
  const converted = numberSystems[countingChannel.type].convert(input);

  // next line is already checked in this function but it was prior to the potential message fetch. we double-check this to avoid a race condition
  if (countingChannel.count.messageId === message.id && (
    converted !== countingChannel.count.number ||
    await checkRegex(message.content, countingChannel.filters)
  )) return void replaceUpdatedOrDeletedMessage(message, document, countingChannel, false);

  return void 0;
})());

client.on("messageDelete", partialMessage => void (async () => {
  if (!partialMessage.guildId || disabledGuilds.has(partialMessage.guildId)) return;

  const document = await getGuildDocument(partialMessage.guildId);
  const countingChannel = document.channels.get(partialMessage.channelId);
  if (countingChannel?.count.messageId !== partialMessage.id) return;

  return void replaceUpdatedOrDeletedMessage(partialMessage, document, countingChannel, true);
})());

// discord debug logging
client
  .on("cacheSweep", message => void discordLogger.debug(message))
  .on("debug", info => void discordLogger.debug(info))
  .on("error", error => void discordLogger.error(`Cluster errored. ${inspect(error)}`))
  .on("rateLimit", rateLimitData => void discordLogger.warn(`Rate limit ${JSON.stringify(rateLimitData)}`))
  .on("ready", () => void discordLogger.info("All shards have been connected."))
  .on("shardDisconnect", (_, id) => void discordLogger.warn(`Shard ${id} disconnected.`))
  .on("shardError", (error, id) => void discordLogger.error(`Shard ${id} errored. ${inspect(error)}`))
  .on("shardReady", id => void discordLogger.info(`Shard ${id} is ready.`))
  .on("shardReconnecting", id => void discordLogger.warn(`Shard ${id} is reconnecting.`))
  .on("shardResume", (id, replayed) => void discordLogger.info(`Shard ${id} resumed. ${replayed} events replayed.`))
  .on("warn", info => void discordLogger.warn(info));

// websocket and login
const ws = initializeWebsocket(client);
void Promise.all([
  connection,
  new Promise((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
  }),
])
  .then(() => {
    const initMessage: CommunicationMessage = {
      type: CommunicationType.CTM_INITIALIZE,
      payload: {
        clusterId: config.cluster.id,
        clusterShards: config.cluster.shards,
        timestamp: Date.now(),
      },
    };
    ws.send(JSON.stringify(initMessage));
  // websocket will login once it's allowed to do so
  })
  .catch(() => {
    mainLogger.error("Failed to initialize. Is the manager and the database running?");
    process.exit(1);
  });

process
  .on("uncaughtException", error => mainLogger.warn(`Uncaught exception: ${inspect(error)}`))
  .on("unhandledRejection", error => mainLogger.warn(`Unhandled rejection: ${inspect(error)}`));
