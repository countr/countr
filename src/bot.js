const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("../config.json"), countingHandler = require("./handlers/counting.js"), commandHandler = require("./handlers/commands.js");

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

let shard = "Shard N/A:", fails = new Map(), disabledGuilds = null;

client.on("shardReady", async (shardid, unavailable = []) => {
  shard = `Shard ${shardid}:`;
  console.log(shard, `Ready as ${client.user.tag}!`)

  disabledGuilds = client.guilds.cache.map(guild => guild.id);
  disabledGuilds.push(...unavailable) // we add the unavailable guilds as well
  let startTimestamp = Date.now()
  await Promise.all(client.guilds.cache.map(processGuild))
  console.log(shard, `All ${client.guilds.cache.size} available guilds have been processed and is now ready for counting! [${Date.now() - startTimestamp}ms]`)
  disabledGuilds = []

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

// command handler
const commands = new Map(), aliases = new Map();
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) {
    const commandFile = require(`./commands/${file}`), fileName = file.replace(".js", "");
    commands.set(fileName, commandFile);
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, fileName);
  }
})

client.on("message", async message => {
  if (
    !message.guild || // dms
    disabledGuilds == null ||
    disabledGuilds.includes(message.guild.id)
  ) return;

  // since we opt in for partials, we need to add these checks
  if (message.partial && (!message.author || !message.channel || !message.content)) message = await message.fetch();
  if (message.author.partial && !message.author.bot) message.author = await message.author.fetch();
  if (message.author.bot) return; // we don't allow bots
  if (message.channel.partial && !message.channel.id) message.channel = await message.channel.fetch();

  const gdb = await db.guild(message.guild.id);
  let { channel, prefix } = gdb.get();

  // 
  if (channel == message.channel.id) return countingHandler(); // TODO add args

  if (!prefix) prefix = config.prefix;
  if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) return commandHandler(); // TODO add args
  else if (message.content.match(`^<@!?${client.user.id}>`))
})