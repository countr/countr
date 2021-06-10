module.exports = {
  description: "Get information and stats about the bot.",
  usage: {},
  examples: {},
  aliases: [ "stats", "botinfo", "botstats" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
};

const os = require("os"), platform = `${os.type()} (${os.release()})`, djsversion = require("../../package.json").dependencies["discord.js"], config = require("../../config.json"), { /*generateTip, */msToTime } = require("../constants/index.js");

let guilds = 0, users = 0, shardCount = 0, memory = 0, memoryUsage = "0MB", memoryGlobal = 0, memoryUsageGlobal = "0MB", nextUpdate = Date.now();

module.exports.run = async (message, _, gdb, { prefix }) => {
  if (nextUpdate < Date.now()) {
    nextUpdate = Date.now() + 300000; 
    if (message.client.shard) {
      guilds = await message.client.shard.broadcastEval("this.guilds.cache.size").then(res => res.reduce((prev, val) => prev + val, 0));
      users = await message.client.shard.broadcastEval("this.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)").then(res => res.reduce((prev, val) => prev + val, 0));
      shardCount = message.client.shard.count;
    } else {
      guilds = message.client.guilds.cache.size;
      users = message.client.users.cache.size;
      shardCount = 0;
    }

    const { heapUsed, rss } = process.memoryUsage();

    memory = heapUsed / (1048576); // 1024*1024
    if (memory >= 1024) memoryUsage = (memory / 1024).toFixed(2) + "GB";
    else memoryUsage = memory.toFixed(2) + "MB";

    memoryGlobal = rss / (1048576); // 1024*1024
    if (memoryGlobal >= 1024) memoryUsageGlobal = (memoryGlobal / 1024).toFixed(2) + "GB";
    else memoryUsageGlobal = memoryGlobal.toFixed(2) + "MB";
  }

  message.channel.send({
    embed: {
      title: `Bot Information - ${message.client.user.tag}`,
      description: "Countr is an advanced counting bot which can manage a counting channel in your guild. With a simple setup, your channel is ready.",
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Requested by ${message.author.tag}`
      },
      fields: [
        {
          name: "💠 Host",
          value: [
            `**OS**: \`${platform}\``,
            `**Library**: \`discord.js${djsversion}\``,
            `**Memory Usage**: \`${message.client.shard ? memoryUsageGlobal : memoryUsage}\``
          ].join("\n"),
          inline: true
        },
        {
          name: "🌀 Stats",
          value: [
            `**Guilds**: \`${guilds}\``,
            `**Users**: \`${users}\``,
            `**Shard Count**: \`${shardCount}\``
          ].join("\n"),
          inline: true
        },
        {
          name: message.client.shard ? `🔷 This Shard (${message.guild.shardID})` : false,
          value: [
            `**Guilds**: \`${message.client.guilds.cache.size}\``,
            `**Users**: \`${message.client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)}\``,
            `**Memory Usage**: \`${memoryUsage}\``,
            `**Uptime**: \`${msToTime(message.client.uptime)}\``
          ].join("\n"),
          inline: true
        },
        {
          name: "🌐 Links",
          value: [
            `**Invite me:** [https://discordapp.com/api/oauth2/authorize?...](https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=805334032&scope=bot%20applications.commands)`,
            "**Source Code**: https://github.com/countr/countr",
            "**Support Server**: https://promise.solutions/support"
          ].join("\n"),
          inline: false
        }
      ].filter(f => f.name) // filters out shard field if sharding is disabled
    }
  })
  //.then(m => m.edit(generateTip(prefix)))
    .catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
};
