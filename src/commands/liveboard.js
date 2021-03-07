module.exports = {
  description: "Set up a liveboard in your server.",
  usage: {
    "<channel>|disable": "Specify what channel you want the liveboard to be in."
  },
  examples: {},
  aliases: [],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1,
  allowInCountingChannel: true,
  premiumOnly: true
};

const { getChannel } = require("../constants/index.js");

module.exports.run = async (message, [ channelSearch ], gdb) => {
  if (channelSearch == "disable") {
    gdb.set("liveboard", {});
    return message.channel.send("✅ The liveboard has been disabled.");
  } else {
    const channel = getChannel(channelSearch, message.guild);
    if (!channel) return message.channel.send("❌ Invalid channel.");

    const { channel: countingChannel } = gdb.get();
    if (channel.id == countingChannel) return message.channel.send("❌ The liveboard cannot be in the counting channel.");

    const m = await channel.send("💤 Loading...").catch(() => false);
    if (!m) return message.channel.send("❌ I don't have permission to send a message in this channel.");

    gdb.set("liveboard", {
      channel: channel.id,
      message: m.id
    });

    return message.channel.send("✅ The liveboard has been enabled.");
  }
};