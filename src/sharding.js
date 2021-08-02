const { ShardingManager } = require("discord.js"), config = require("../config");

const manager = new ShardingManager("./src/bot.js", {
  totalShards: config.client.shards || "auto",
  token: config.client.token,
  mode: "worker"
});

manager.on("shardCreate", shard => {
  shard.on("message", m => {
    if (m == "respawn") {
      console.log(`Manager: Shard ${shard.id} has requested a respawn.`);
      shard.respawn();
    }
  });
  console.log(`Manager: Shard ${shard.id} has been created and is starting.`);
});

// api stuff

manager.spawn();