const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("../config.json"), countingHandler = require("./handlers/counting.js"), commandHandler = require("./handlers/commands.js"), prepareGuildHandler = require("./handlers/prepareGuilds.js");

const client = new Discord.Client({
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
  disableMentions: "everyone",
  partials: [ "USER", "GUILD_MEMBER", "CHANNEL" ],
  presence: {
    status: "idle",
    activity: {
      type: "WATCHING",
      name: "the loading screen"
    }
  },
  ws: {
    intents: [ "GUILDS", "GUILD_MESSAGES" ]
  }
}), db = require("./database/index.js")(client);

let shard = "Shard N/A:", disabledGuilds = null;

client.once("shardReady", async (shardid, unavailable = new Set()) => {
  shard = `Shard ${shardid}:`;
  console.log(shard, `Ready as ${client.user.tag}!`)

  // process guilds
  disabledGuilds = new Set([...client.guilds.cache.map(guild => guild.id), ...unavailable]);
  await prepareGuildHandler(disabledGuilds, client, db, shard);
  disabledGuilds = new Set();

  // update presence
  updatePresence();
  client.setInterval(updatePresence, 60000)
})

async function updatePresence() {
  let name = `${config.prefix}help • ${await db.global.getCount()} counts this week!`, guild = client.guilds.cache.get(config.mainGuild);
  if (guild) {
    const gdb = await db.guild(guild.id), { channel, count } = gdb.get();
    name = `#${guild.channels.cache.get(channel).name} • ${count}`
  }
  return client.user.setPresence({
    status: "online",
    activity: {
      type: "WATCHING",
      name
    }
  })
}

client.on("message", async message => {
  if (
    !message.guild || // dms
    !disabledGuilds ||
    disabledGuilds.has(message.guild.id)
  ) return;

  // since we opt in for partials, we need to add these checks. It shouldn't need this in v12 anymore, but it's always good to be sure.
  if (message.partial && (!message.author || !message.channel || !message.content)) message = await message.fetch();
  if (message.author.partial && !message.author.bot) message.author = await message.author.fetch();
  if (message.author.bot) return; // we don't allow bots
  if (message.channel.partial && !message.channel.id) message.channel = await message.channel.fetch();

  const gdb = await db.guild(message.guild.id);
  let { channel, prefix } = gdb.get();
  if (!prefix.length) prefix = config.prefix;

  if (channel == message.channel.id) return countingHandler(); // TODO add args

  if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) return commandHandler(message, gdb, db, prefix);
  else if (message.content.match(`^<@!?${client.user.id}>`)) return message.channel.send(`My prefix is \`${prefix}\`, for help type \`${prefix}help\`.`)
})

client
  .on("error", err => console.log(shard, "Client error.", err))
  .on("rateLimit", rateLimitInfo => console.log(shard, "Rate limited.", rateLimitInfo))
  .on("shardDisconnected", closeEvent => console.log(shard, "Disconnected.", closeEvent))
  .on("shardError", err => console.log(shard, "Error.", err))
  .on("shardReconnecting", () => console.log(shard, "Reconnecting."))
  .on("shardResume", (_, replayedEvents) => console.log(shard, `Resumed. ${replayedEvents} replayed events.`))
  .on("warn", info => console.log(shard, "Warning.", info))
  .login(config.token)

if (config.listKeys && Object.values(config.listKeys).length) BLAPI.handle(client, config.listKeys);