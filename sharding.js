// You do not need to use this file at all. 99/100 times, if you host the bot yourself it's for your own guild - sharding is for big bots such as Countr is today. 

const Discord = require("discord.js");
const express = require("express");
const config = require("./config.json");
let apiInfo = {};

const manager = new Discord.ShardingManager("./app.js", { totalShards: "auto", respawn: true, token: config.token })
manager.spawn();
manager.on("launch", async shard => {
    console.log("Shard " + shard.id + " starting.")
})

if (config.webAPI) {
    const webAPI = express();
    webAPI.listen(80)

    webAPI.get("/", async (request, response) => {
        response.json(apiInfo)
    })

    setInterval(async () => {
        let rawShards = Array.from(manager.shards.values()), shards = {};
        for (var i in rawShards) shards["SHARD_" + rawShards[i].id] = rawShards[i];
        
        newInfo = {
            guilds: await manager.fetchClientValues('guilds.size').then(r => r.reduce((prev, val) => prev + val, 0)),
            users: await manager.fetchClientValues('users.size').then(r => r.reduce((prev, val) => prev + val, 0)),
            shards: {}
        };

        for (var s in shards) newInfo.shards[s] = {
            ready: shards[s].ready,
            guilds: await shards[s].fetchClientValue('guilds.size').catch(() => null),
            users: await shards[s].fetchClientValue('users.size').catch(() => null)
        }

        apiInfo = newInfo;
    }, 5000)
}