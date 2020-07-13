const Discord = require("discord.js"), express = require("express"), config = require("../config.json");

const manager = new Discord.ShardingManager("./src/bot.js", {
  token: config.token
})

manager.on("shardCreate", shard => {
  console.log(`Manager: Shard ${shard.id} is starting.`);
  shard.on("death", () => console.log(`Manager: Shard ${shard.id} died. Attempting to respawn.`) && shard.respawn())
})

if (config.port) {
  const api = express();
  let botInfo = {};
  api.get("/", (_, response) => response.json(botInfo));

  setInterval(async () => {
    const newBotInfo = {
      guilds: 0,
      cachedUsers: 0,
      users: 0,
      shards: {}
    };

    await Promise.all(manager.shards.map(shard => new Promise(async resolve => {
      const newShardInfo = {
        status: shard.fetchClientValue("status").catch(() => 6),
        guilds: shard.fetchClientValue("guilds.cache.size").catch(() => null),
        cachedUsers: shard.fetchClientValue("users.cache.size").catch(() => null),
        users: shard.eval(client => client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b))
      }

      await Promise.all(Object.values(newShardInfo));

      if (newShardInfo.guilds) newBotInfo.guilds += newShardInfo.guilds;
      if (newShardInfo.users) newBotInfo.users += newShardInfo.users;
      if (newShardInfo.cachedUsers) newBotInfo.cachedUsers += newShardInfo.cachedUsers;

      newShardInfo.shards[`${shard.id}`] = newShardInfo;
      resolve()
    })))

    botInfo = newBotInfo;
  }, 30000)

  api.listen(config.port)
}

manager.spawn()