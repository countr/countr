module.exports = {
  description: "Get information and stats about the bot.",
  usage: {},
  examples: [],
  aliases: ["botinfo", "botstats"],
  permissionRequired: 0,
  checkArgs: (args) => {
    return true;
  }
}

const os = require("os"), platform = os.type() + " (" + os.release() + ")", djsversion = require("../package.json").dependencies["discord.js"];

let memory = 0, memoryUsage = "0mb";
setInterval(() => {
  memory = process.memoryUsage().heapUsed / (1024 * 1024)
  memoryUsage = memory.toFixed(2) + "mb"
}, 15000)

let guilds = 0, users = 0, shardCount = 0, nextUpdate = Date.now();

module.exports.run = async function(client, message, args, config, db) {
  if (nextUpdate < Date.now()) {
    nextUpdate = Date.now() + 300000
    if (client.shard) {
      guilds = await client.shard.fetchClientValues('guilds.size').then(res => res.reduce((prev, val) => prev + val, 0))
      users = await client.shard.fetchClientValues('users.size').then(res => res.reduce((prev, val) => prev + val, 0))
      shardCount = client.shard.count
    } else {
      guilds = client.guilds.size
      users = client.users.size
      shardCount = 1
    }
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
            "**Memory Usage**: `" + memoryUsage + "`"
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
          "name": "📶 Ping",
          "value": [
            "**Server**: `" + (message.createdAt - Date.now()) + "ms`",
            "**API**: `" + client.ping + "ms`",
            "**Uptime**: `" + msToTime(client.uptime) + "`"
          ].join("\n"),
          "inline": true
        },
        {
          "name": "🌐 Links",
          "value": [
            "**Documentation:** https://countr.xyz/",
            "**Support Server**: https://discord.gg/vDg9jAE",
            "**Source Code**: https://github.com/gleeny/countr"
          ].join("\n"),
          "inline": false
        },
        {
          "name": "💝 Premium",
          "value": [
            "**Want to get premium features for your server?** https://countr.xyz/premium",
            "**Want to donate just as a thank you?** https://ko-fi.com/promise"
          ].join("\n"),
          "inline": false
        }
      ]
    }
  })
}

function msToTime(ms){
  days = Math.floor(ms / (24*60*60*1000));
  daysms = ms % (24*60*60*1000);
  hours = Math.floor((daysms)/(60*60*1000));
  hoursms = ms % (60*60*1000);
  minutes = Math.floor((hoursms)/(60*1000));
  minutesms = ms % (60*1000);
  sec = Math.floor((minutesms)/(1000));

  let str = "";
  if (days) str = str + days + "d";
  if (hours) str = str + hours + "h";
  if (minutes) str = str + minutes + "m";
  if (sec) str = str + sec + "s";

  return str;
}