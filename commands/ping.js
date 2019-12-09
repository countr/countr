module.exports = {
  description: "Get the latency of the bot.",
  usage: {},
  examples: {},
  aliases: [ "pong", "latency", "uptime" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  message.channel.send({ embed: {
    title: "📶 Ping",
    description: [
      "**Server**: `" + (Date.now() - message.createdAt) + "ms`",
      "**API**: `" + Math.round(client.ping) + "ms`",
      "**Uptime**: `" + msToTime(client.uptime) + "`"
    ].join("\n"),
    color: config.color,
    footer: { text: "Requested by " + message.author.tag, icon_url: message.author.displayAvatarURL },
    timestamp: Date.now()
  }}).catch(() => message.channel.send("🆘 An unknown error occoured. Do I have permission? (Embed Links)"));
}