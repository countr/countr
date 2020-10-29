module.exports = {
  description: "Link a counting channel manually.",
  usage: {
    "[<channel>]": "The new counting channel. Leave empty to choose current channel."
  },
  examples: {},
  aliases: [ "connect" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 0 || args.length == 1
};

const { getChannel } = require("../constants");

module.exports.run = async (message, [ channelSearch ], gdb) => {
  let channel = channelSearch ? getChannel(channelSearch, message.guild) : message.channel;
  if (!channel) return message.channel.send("❌ Invalid channel.");

  gdb.setMultiple({
    channel: channel.id,
    count: 0,
    user: "",
    message: (parseInt(message.id) + 1).toString()
  });

  if (channelSearch) return message.channel.send(`✅ ${channel} is now linked! Happy counting!`);
  else return message.channel.send("✅ This channel has been linked! Happy counting!");
};