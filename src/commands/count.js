module.exports = {
  description: "Get the current count.",
  usage: {},
  examples: {},
  aliases: [ "!" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb) => {
  const { count } = gdb.get();
  return message.channel.send(`ℹ The current count is ${count}.`);
};