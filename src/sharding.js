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

  for (const shard in Array.from(manager.shards)) {
    const newShardInfo = {
      status: await shard.fetchClientValue("ws.status").catch(() => 6),
      guilds: await shard.fetchClientValue("guilds.cache.size").catch(() => null),
      cachedUsers: await shard.fetchClientValue("users.cache.size").catch(() => null),
      users: await shard.fetchClientValue("guilds.cache").then(guilds => guilds.map(g => g.memberCount).reduce((a, b) => a + b)).catch(() => null)
    };

    if (newShardInfo.guilds) newBotInfo.guilds += newShardInfo.guilds;
    if (newShardInfo.users) newBotInfo.users += newShardInfo.users;
    if (newShardInfo.cachedUsers) newBotInfo.cachedUsers += newShardInfo.cachedUsers;

    newBotInfo.shards[`${shard.id}`] = newShardInfo;
  }

  botInfo = newBotInfo;
}

manager.spawn();