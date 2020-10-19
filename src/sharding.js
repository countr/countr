const Discord = require("discord.js"), express = require("express"), config = require("../config.json");

const manager = new Discord.ShardingManager("./src/bot.js", {
  token: config.token
})

manager.on("shardCreate", shard => console.log(`Manager: Shard ${shard.id} is starting.`))

if (config.port) {
  const api = express();
  let botInfo = {};
  api.get("/", (_, response) => response.json(botInfo));

  setInterval(async () => {
    const newBotInfo = {
      guilds: 0,
      cachedUsers: 0,
      users: 0,
      shards: {},
      lastUpdate: Date.now()
    }

    await Promise.all(manager.shards.map(shard => new Promise(async resolve => {
      const newShardInfo = {
        status: await shard.fetchClientValue("ws.status").catch(() => 6),
        guilds: await shard.fetchClientValue("guilds.cache.size").catch(() => null),
        cachedUsers: await shard.fetchClientValue("users.cache.size").catch(() => null),
        users: await shard.fetchClientValue("guilds.cache").then(guilds => guilds.map(g => g.memberCount).reduce((a, b) => a + b)).catch(() => null)
      }

      if (newShardInfo.guilds) newBotInfo.guilds += newShardInfo.guilds;
      if (newShardInfo.users) newBotInfo.users += newShardInfo.users;
      if (newShardInfo.cachedUsers) newBotInfo.cachedUsers += newShardInfo.cachedUsers;

      newBotInfo.shards[`${shard.id}`] = newShardInfo;
      resolve()
    })))

    botInfo = newBotInfo;
  }, 30000)

  api.listen(config.port)
}

manager.spawn()