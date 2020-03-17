const Discord = require("discord.js"), express = require("express"), config = require("../config.json"), api = express();

const manager = new Discord.ShardingManager("./src/bot.js", {
  token: config.token,
  totalShards: 2
})

let bot = {};

manager.on("shardCreate", shard => console.log(`Manager: Shard ${shard.id} is starting.`))
api.get("/", (_, response) => response.json(bot))

setInterval(async () => {
  const rawShards = Array.from(manager.shards.values()), newInfo = { guilds: 0, users: 0, shards: {} };
  
  await Promise.all(rawShards.map(shard => new Promise(async resolve => {
    const shardInfo = {
      status: await shard.fetchClientValue("status").catch(() => 6),
      guilds: await shard.fetchClientValue("guilds.cache.size").catch(() => null),
      users: await shard.fetchClientValue("users.cache.size").catch(() => null)
    };

    if (shardInfo.guilds) newInfo.guilds += shardInfo.guilds;
    if (shardInfo.users) newInfo.users += shardInfo.users;

    newInfo.shards[`SHARD_${shard.id}`] = shardInfo;
    resolve()
  })))

  bot = newInfo;
}, 30000)

manager.spawn()
api.listen(config.port)