module.exports = {
  description: "Get information and stats about the bot.",
  usage: {},
  examples: {},
  aliases: [ "botinfo", "botstats" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

const os = require("os"), platform = os.type() + " (" + os.release() + ")", djsversion = require("../package.json").dependencies["discord.js"];

let guilds = 0, users = 0, shardCount = 0, memory = 0, memoryUsage = "0MB", memoryGlobal = 0, memoryUsageGlobal = "0MB", nextUpdate = Date.now();

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  if (nextUpdate < Date.now()) {
    nextUpdate = Date.now() + 300000
    if (client.shard) {
      guilds = await client.shard.fetchClientValues('guilds.size').then(res => res.reduce((prev, val) => prev + val, 0))
      users = await client.shard.fetchClientValues('users.size').then(res => res.reduce((prev, val) => prev + val, 0))
      shardCount = client.shard.count
    } else {
      guilds = client.guilds.size
      users = client.users.size
      shardCount = 0
    }

    memory = process.memoryUsage().heapUsed / (1048576) // 1024*1024
    if (memory >= 1024) memoryUsage = (memory / 1024).toFixed(2) + "GB"
    else memoryUsage = memory.toFixed(2) + "MB"

    memoryGlobal = (os.totalmem() - os.freemem()) / (1048576) // 1024*1024
    if (memoryGlobal >= 1024) memoryUsageGlobal = (memoryGlobal / 1024).toFixed(2) + "GB"
    else memoryUsageGlobal = memoryGlobal.toFixed(2) + "MB"
  }

  message.channel.send({
    "embed": {
      "title": "Bot Information - " + client.user.tag,
      "description": "Countr is an advanced counting bot that can manage a counting channel in your guild. With a simple setup, your channel is ready.",
      "color": config.color,
      "timestamp": Date.now(),
      "footer": {
        "icon_url": message.author.displayAvatarURL,
        "text": "Requested by " + message.author.tag
      },
      "fields": [
        {
          "name": "💠 Host",
          "value": [
            "**OS**: `" + platform + "`",
            "**Library**: `discord.js" + djsversion + "`",
            "**Memory Usage**: `" + (client.shard ? memoryUsageGlobal : memoryUsage) + "`"
          ].join("\n"),
          "inline": true
        },
        {
          "name": "🌀 Stats",
          "value": [
            "**Guilds**: `" + guilds + "`",
            "**Users**: `" + users + "`",
            "**Shard Count**: `" + shardCount + "`"
          ].join("\n"),
          "inline": true
        },
        {
          "name": client.shard ? "🔷 This Shard (" + client.shard.id + ")" : false,
          "value": [
            "**Guilds**: `" + client.guilds.size + "`",
            "**Users**: `" + client.users.size + "`",
            "**Memory Usage**: `" + memoryUsage + "`"
          ].join("\n"),
          "inline": true
        },
        {
          "name": "🌐 Links",
          "value": [
            "**Documentation:** https://countr.xyz/",
            "**Invite me:** [https://discordapp.com/api/oauth2/authorize?...](https://discordapp.com/api/oauth2/authorize?client_id=" + client.user.id + "&permissions=805432400&scope=bot)",
            "**Uptime:** https://uptime.countr.xyz/",
            "**Source Code**: https://github.com/promise/countr"
          ].join("\n"),
          "inline": false
        },
        {
          "name": "💝 Premium",
          "value": [
            "**Want to get premium features for your server?** https://countr.xyz/#/premium",
            "**Want to donate just as a thank you?** https://ko-fi.com/promise"
          ].join("\n"),
          "inline": false
        }
      ].filter(f => f.name) // filters out shard field if sharding is disabled
    }
  }).catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
}