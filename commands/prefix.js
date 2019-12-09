module.exports = {
  description: "Set a new prefix for the bot.",
  usage: {
    "<prefix ...>": "The new prefix. If you want to end your prefix with a space, end the prefix with {{SPACE}}."
  },
  examples: {
    "c?": "Set the prefix to c?, the help command would then be c?help.",
    "Hey Countr,{{SPACE}}": "Set the prefix to a Google Assistant-like one."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let prefix = args.join(" ").replace("{{SPACE}}", "")

  gdb.set("prefix", prefix)
    .then(() => message.channel.send("✅ Prefix has been saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occoured. Please try again, or contact support."))
}