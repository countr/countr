const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("../config.json"), countingHandler = require("./handlers/counting.js"), commandHandler = require("./handlers/commands.js"), getTranslations = require("./handlers/translations.js");

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

client.on("shardReady", async (shardid, unavailable = new Set()) => {
  shard = `Shard ${shardid}:`;
  console.log(shard, `Ready as ${client.user.tag}!`)

  // process guilds
  disabledGuilds = new Set(client.guilds.cache.map(guild => guild.id))
  unavailable.forEach(guildid => disabledGuilds.add(guildid)) // we add the unavailable guilds as well
  let startTimestamp = Date.now()
  await Promise.all(client.guilds.cache.map(processGuild))
  console.log(shard, `All ${client.guilds.cache.size} available guilds have been processed and is now ready for counting! [${Date.now() - startTimestamp}ms]`)
  disabledGuilds = false

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
    disabledGuilds == null ||
    disabledGuilds.has(message.guild.id)
  ) return;

  // since we opt in for partials, we need to add these checks
  if (message.partial && (!message.author || !message.channel || !message.content)) message = await message.fetch();
  if (message.author.partial && !message.author.bot) message.author = await message.author.fetch();
  if (message.author.bot) return; // we don't allow bots
  if (message.channel.partial && !message.channel.id) message.channel = await message.channel.fetch();

  const gdb = await db.guild(message.guild.id);
  let { channel, prefix = config.prefix } = gdb.get();

  if (channel == message.channel.id) return countingHandler(); // TODO add args

  if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) return commandHandler(message, prefix, gdb, db); // TODO add args
  else if (message.content.match(`^<@!?${client.user.id}>`)) return message.channel.send(getTranslations(gdb).hello)
})

async function processGuild(guild) {
  const gdb = await db.guild(guildid), { timeouts, timeoutrole, modules, channel: channelid, message: messageid } = await gdb.get();

  // timeouts
  for (let userid in timeouts) try {
    let member = guild.members.resolve(userid);
    if (!member) member = await guild.members.fetch(userid);
    if (member && member.partial) member = await member.fetch();
    if (member && member.roles.cache.get(timeoutrole.role)) {
      if (Date.now() >= timeouts[userid]) member.roles.remove(timeoutrole.role, "User no longer timed out (offline)").catch()
      else setTimeout(() => member.roles.remove(timeoutrole.role, "User no longer timed out").catch(), timeouts[userid] - Date.now())
    }
  } catch(e) {}

  // recover module
  if (modules.includes("recover")) try {
    let channel = guild.channels.resolve(channelid);
    if (channel && channel.partial) channel = await channel.fetch();
    if (channel) {
      let messages = await channel.messages.fetch({ limit: 1, after: messageid });
      if (messages.size) {
        const strings = getTranslations(gdb), alert = await channel.send(`💢 ${strings.channelGettingReady}`);
        if (!channel.permissionsFor(guild.me).has("SEND_MESSAGES")) await channel.updateOverwrite(guild.me, { SEND_MESSAGES: true });

        let defaultPermissions = channel.permissionOverwrites.get(guild.roles.everyone), oldPermission = null;
        if (defaultPermissions.allow.has("SEND_MESSAGES")) oldPermission = true;
        else if (defaultPermissions.deny.has("SEND_MESSAGES")) oldPermission = false;

        await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: false }, "Making channel ready for counting");

        let processing = true, fail = false;
        while (processing) {
          let messages = await channel.messages.fetch({ limit: 100, after: messageid });
          messages = messages.filter(m => m.id !== alert.id);
          if (messages.size == 0) processing = false;
          else await channel.bulkDelete(messages).catch(() => {
            processing = false;
            fail = true;
          })
        }

        await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: oldPermission })
        if (fail) alert.edit(`❌ ${strings.channelGettingReadyError}`);
        else alert.edit(`🔰 ${strings.channelGettingReadyDone}`).then(m => m.delete(15000))
      }
    }
  } catch(e) {}

  disabledGuilds.delete(guild.id);
}

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