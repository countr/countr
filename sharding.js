// You do not need to use this file at all. 99/100 times, if you host the bot yourself it's for your own guild - sharding is for big bots such as Countr is today. 

const Discord = require("discord.js"), express = require("express"), config = require("./config.json");
let apiInfo = {};

const manager = new Discord.ShardingManager("./app.js", { totalShards: "auto", respawn: true, token: config.token })

manager.spawn();
manager.on("launch", async shard => {
    console.log("Shard " + shard.id + " starting.")
})

if (config.hostname) {
    const webAPI = express();
    webAPI.listen(80)

    webAPI.get("/", async (request, response) => {
        response.json(apiInfo)
    })

    setInterval(async () => {
        let rawShards = Array.from(manager.shards.values()), shards = {};
        for (var shard of rawShards) shards["SHARD_" + shard.id] = shard;
        
        let newInfo = {
            guilds: await manager.fetchClientValues("guilds.size").then(r => r.reduce((prev, val) => prev + val, 0)),
            users: await manager.fetchClientValues("users.size").then(r => r.reduce((prev, val) => prev + val, 0)),
            shards: {}
        };

        for (var s in shards) newInfo.shards[s] = {
            status: await shards[s].fetchClientValue("status").catch(() => 6), // https://discord.js.org/#/docs/main/stable/typedef/Status & 6 = unable to reach shard
            guilds: await shards[s].fetchClientValue("guilds.size").catch(() => null),
            users: await shards[s].fetchClientValue("users.size").catch(() => null)
        }

        apiInfo = newInfo;
    }, 30000)
}