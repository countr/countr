module.exports = {
  description: "Gets a link to the webboard of Countr",
  usage: {},
  examples: {},
  aliases: [ "web", "admininterface", "interface", "analytics" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  message.channel.send("📈 Your link to the web scoreboard is: <https://analytics.countr.xyz/viewguild.php/?id=" + message.guild.id + ">");
}
