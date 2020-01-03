module.exports = {
  description: "Get an invite to add the bot.",
  usage: {},
  examples: {},
  aliases: [ "addme", "inviteme" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  message.channel.send("🔗 Invite me here: <https://discordapp.com/api/oauth2/authorize?client_id=" + client.user.id + "&permissions=805432400&scope=bot>");
}