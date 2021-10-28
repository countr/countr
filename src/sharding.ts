import { ShardingManager } from "discord.js";
import config from "./config";

const manager = new ShardingManager(`${__dirname}/bot.js`, {
  totalShards: config.client.shards || "auto",
  token: config.client.token,
  mode: "worker"
});

manager.on("shardCreate", shard => {
  shard.on("message", message => {
    if (message == "respawn") {
      console.log(`Manager: Shard ${shard.id} has requested a respawn.`);
      shard.respawn();
    }
  });
  console.log(`Manager: Shard ${shard.id} has been created and is starting.`);
});

// todo: api stuff

manager.spawn();
