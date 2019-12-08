module.exports = {
  description: "Get a list of regex filters.",
  usage: {},
  examples: {},
  aliases: [],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let { regex } = await gdb.get();

  if (!regex.length) return message.channel.send("❌ No regex filters for this server has been set up.")
  
  message.channel.send("📋 Regex filters for this server:\n" + regex.map(l => "- \`" + l + "\`").join("\n"))
}