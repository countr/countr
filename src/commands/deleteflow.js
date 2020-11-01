module.exports = {
  description: "Delete a flow.",
  usage: {
    "<flow ID>": "The ID of the flow you want to delete. This can be found in the 'listflows'-command."
  },
  examples: {},
  aliases: [ "delflow", "removeflow", "-flow" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1,
  allowInCountingChannel: true
};

module.exports.run = async (message, [ flowID ], gdb) => {
  const { flows } = gdb.get();
  if (!flows[flowID]) return message.channel.send("❌ This flow does not exist.");

  gdb.removeFromObject("flows", flowID);

  return message.channel.send(`✅ Flow \`${flowID}\` has been deleted.`);
};