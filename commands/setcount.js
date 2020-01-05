module.exports = {
  description: "Set the count.",
  usage: {
    "<count>": "The new count."
  },
  examples: {},
  aliases: [ "set", "=", "=count" ],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let count = parseInt(args[0])
  if (!count) return message.channel.send("❌ Invalid count. For help, type `" + prefix + "help set`")

  gdb.setMultiple({ count, user: "" })
    .then(() => message.channel.send("✅ The new count has been reset."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}