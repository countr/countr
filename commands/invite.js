module.exports = {
  description: "Get an invite to add the bot.",
  usage: {},
  examples: {},
  aliases: [ "addme", "inviteme" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  message.channel.send({
    "embed": {
      "title": "Invite Countr",
      "description": "[https://discordapp.com/api/oauth2/authorize?...](https://discordapp.com/api/oauth2/authorize?client_id=" + client.user.id + "&permissions=805432400&scope=bot)",
      "color": config.color,
      "timestamp": Date.now(),
      "footer": {
        "icon_url": message.author.displayAvatarURL,
        "text": "Requested by " + message.author.tag
      }
    }
  }).catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
}