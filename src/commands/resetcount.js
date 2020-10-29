module.exports = {
  description: "Reset the count.",
  usage: {},
  examples: {},
  aliases: [ "re=count", "reset" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb) => {
  gdb.setMultiple({
    count: 0,
    user: ""
  });

  return message.channel.send("✅ The count has been reset.");
};