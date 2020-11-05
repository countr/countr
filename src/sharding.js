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
  api.get("/newest", async (_, response) => {
    const newInfo = await updateBotInfo();
    return response.json(newInfo);
  });
  api.listen(config.port);
}

async function updateBotInfo() {
  const newBotInfo = await manager.broadcastEval(client => ({
    status: client.ws.status,
    guilds: client.guilds.cache.size,
    cachedUsers: client.users.size,
    users: client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0)
  })).then(results => results.reduce((info, next) => {
    for (const [key, value] of Object.entries(next)) {
      info[key] = (info[key] || 0) + value; 
    }
    info.shards.push(next);
    return info;
  }, { shards: [] }));
  newBotInfo.lastUpdate = Date.now();
  return botInfo = newBotInfo;
}

manager.spawn();
