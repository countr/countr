module.exports = {
  description: "Get a list of regex filters.",
  usage: {},
  examples: {},
  aliases: [ "regexlist", "regexfilters", "listfilters" ],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb) => {
  const { regex } = gdb.get();
  if (!regex.length) return message.channel.send("❌ No regex filters have been set up for this server.");
  else return message.channel.send(`📋 Regex filters for this server:\n${regex.map(r => `• \`${r}\``).join("\n")}`);
};