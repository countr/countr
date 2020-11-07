module.exports = {
  description: "Unlink the current counting channel.",
  usage: {},
  examples: {},
  aliases: [ "disconnect" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb) => {
  gdb.set("channel", "");
  return message.channel.send("✅ The counting channel is now unlinked.");
};