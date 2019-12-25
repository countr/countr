module.exports = {
  description: "Unlink the current counting channel.",
  usage: {},
  examples: {},
  aliases: [ "disconnect" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  gdb.set("channel", "")
    .then(() => message.channel.send("✅ The counting channel is now unlinked."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}