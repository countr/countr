import { Client, IntentsBitField, MessageType, Options, Partials } from "discord.js";
import { connection, getGuildDocument, touchGuildDocument } from "./database";
import type { CommunicationMessage } from "./utils/cluster/communication";
import { CommunicationType } from "./utils/cluster/communication";
import type { Snowflake } from "discord.js";
import checkRegex from "./handlers/counting/regex";
import config from "./config";
import countingHandler from "./handlers/counting";
import { discordLogger } from "./utils/logger/discord";
import handleAccess from "./handlers/access";
import handleInteractions from "./handlers/interactions";
import handleLiveboard from "./handlers/liveboard";
import { initializeWebsocket } from "./utils/cluster";
import { inspect } from "util";
import { inviteUrl } from "./constants/links";
import { mainLogger } from "./utils/logger/main";
import mentionCommandHandler from "./handlers/mentionCommands";
import { msToHumanSeconds } from "./utils/time";
import numberSystems from "./constants/numberSystems";
import prepareGuild from "./handlers/prepareGuilds";
import { replaceUpdatedOrDeletedMessage } from "./handlers/counting/replacement";

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
  ws: { compress: true },
});

let disabledGuilds = new Set<Snowflake>();

client.once("ready", async trueClient => {
  mainLogger.info(`Ready as ${trueClient.user.tag} on shards ${trueClient.ws.shards.map(shard => shard.id).join(",") || "0"}. Caching guilds.`);

  // perpare guilds
  if (client.guilds.cache.size) {
    disabledGuilds = new Set(client.guilds.cache.map(guild => guild.id));

    // cache guilds
    const cacheStart = Date.now();
    await touchGuildDocument(Array.from(disabledGuilds.values()));
    mainLogger.info(`Cached ${disabledGuilds.size} guilds in ${msToHumanSeconds(Date.now() - cacheStart)}. Processing available guilds.`);

    // process guilds
    const processingStart = Date.now();
    await Promise.all(client.guilds.cache.map(async guild => {
      await prepareGuild(guild);
      disabledGuilds.delete(guild.id);
    }));
    mainLogger.info(`Processed guilds in ${msToHumanSeconds(Date.now() - processingStart)}. (missing: ${disabledGuilds.size})`);

    // finish up
    disabledGuilds = new Set();
  } else mainLogger.warn(`Add the bot with this link: ${inviteUrl(trueClient)}`);

  // client handlers
  handleAccess(trueClient);
  handleInteractions(trueClient);
  handleLiveboard(trueClient);
});

client.on("messageCreate", async message => {
  if (
    !message.inGuild() ||
    disabledGuilds.has(message.guildId) ||
    message.author.bot ||
    message.type !== MessageType.Default
  ) return;

  const document = await getGuildDocument(message.guildId);
  const countingChannel = document.channels.get(message.channelId);
  if (countingChannel) return countingHandler(message, document, countingChannel);

  if (RegExp(`^<@!?${client.user!.id}>`, "u").exec(message.content)) return mentionCommandHandler(message, document);
});

client.on("messageUpdate", async (_, potentialPartialMessage) => {
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
});

client.on("messageDelete", async partialMessage => {
  if (!partialMessage.guildId || disabledGuilds.has(partialMessage.guildId)) return;

  const document = await getGuildDocument(partialMessage.guildId);
  const countingChannel = document.channels.get(partialMessage.channelId);
  if (countingChannel?.count.messageId !== partialMessage.id) return;

  return void replaceUpdatedOrDeletedMessage(partialMessage, document, countingChannel, true);
});

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
  new Promise(resolve => {
    ws.on("open", resolve);
  }),
]).then(() => {
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
});

process
  .on("uncaughtException", error => mainLogger.warn(`Uncaught exception: ${inspect(error)}`))
  .on("unhandledRejection", error => mainLogger.warn(`Unhandled rejection: ${inspect(error)}`));
