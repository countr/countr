const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("../config.json"), { parseArgs, getPermissionLevel, flat } = require("./constants/index.js");

const client = new Discord.Client({
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
  disableMentions: "everyone",
  partials: [ "GUILD_MEMBER" ],
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