module.exports = {
  description: "Remove a regex filter.",
  usage: {
    "<regex ...>": "The regex filter you want to remove."
  },
  examples: {
    "duck|poop": "Will remove the regex filter `duck|poop`."
  },
  aliases: [ "-regex", "removefilter", "-filter" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length,
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb, { content: regex }) => {
  const { regex: regexList } = gdb.get();
  if (!regexList.includes(regex)) return message.channel.send("❌ This regex filter does not exist.");

  gdb.removeFromArray("regex", regex);

  return message.channel.send(`✅ Regex \`${regex}\` has been removed.`);
};