// You do not need to use this file at all. 99/100 times, if you host the bot yourself it's for your own guild - sharding is for big bots such as Countr is today. 

const Discord = require('discord.js');
const config = JSON.parse(require('fs').readFileSync('./config.json', 'utf8'))

const manager = new Discord.ShardingManager('./app.js', { totalShards: "auto", respawn: true, token: config.token })
manager.spawn();
manager.on('launch', async shard => {
    console.log("Shard " + shard.id + " starting.")
})