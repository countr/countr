module.exports = {
  description: "Reset and disable the timeout role.",
  usage: {},
  examples: {},
  aliases: [ "resettimeoutrole", "re=timeoutrole" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb) => {
  gdb.set("timeoutrole", {});

  return message.channel.send("✅ The timeout role has been disabled.");
};