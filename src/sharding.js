const Discord = require("discord.js"), express = require("express"), config = require("../config.json");

const manager = new Discord.ShardingManager("./src/bot.js", {
  token: config.token
});

manager.on("shardCreate", shard => console.log(`Manager: Shard ${shard.id} is starting.`));

let botInfo = {};

if (config.port) {
  const api = express();

  setInterval(updateBotInfo, 30000);

  api.get("/", (_, response) => response.json(botInfo));
  api.get("/newest", (_, response) => updateBotInfo().then(() => response.json(botInfo)));
  api.listen(config.port);
}

async function updateBotInfo() {
  const newBotInfo = {
    guilds: 0,
    cachedUsers: 0,
    users: 0,
    shards: {},
    lastUpdate: Date.now()
  };

  await Promise.all(manager.shards.map(shard => new Promise(resolve => {
    const newShardInfo = {
      status: shard.fetchClientValue("ws.status").then(res => newShardInfo.status = res).catch(() => 6),
      guilds: shard.fetchClientValue("guilds.cache.size").then(res => newShardInfo.guilds = res).catch(() => null),
      cachedUsers: shard.fetchClientValue("users.cache.size").then(res => newShardInfo.cachedUsers = res).catch(() => null),
      users: shard.fetchClientValue("guilds.cache").then(guilds => newShardInfo.users = guilds.map(g => g.memberCount).reduce((a, b) => a + b)).catch(() => null)
    };

    Promise.all(Object.values(newShardInfo)).then(() => {
      if (newShardInfo.guilds) newBotInfo.guilds += newShardInfo.guilds;
      if (newShardInfo.users) newBotInfo.users += newShardInfo.users;
      if (newShardInfo.cachedUsers) newBotInfo.cachedUsers += newShardInfo.cachedUsers;
  
      newBotInfo.shards[`${shard.id}`] = newShardInfo;
      resolve();
    });
  })));

  botInfo = newBotInfo;
}

manager.spawn();