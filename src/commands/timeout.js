module.exports = {
  description: "See how long until you (or someone else) lose the timeout role.",
  usage: {
    "[<member>]": "The user you want to check. Default is yourself."
  },
  examples: {},
  aliases: [ "?", "timer" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length || args.length == 1,
  allowInCountingChannel: true
};

const { getMember, msToTime } = require("../constants/index.js");

module.exports.run = async (message, [ memberSearch ], gdb) => {
  const member = memberSearch ? await getMember(memberSearch, message.guild) : message.member;
  if (!member) return message.channel.send("❌ No member was found with your search.");

  const { timeouts } = gdb.get(), timeout = timeouts[member.id];
  if (member.id == message.author.id) {
    if (!timeout || timeout < Date.now()) return message.channel.send("💨 You're not being timed out!");
    return message.channel.send(`💤 You have \`${msToTime(timeout - Date.now())}\` time left.`);
  } else {
    if (!timeout || timeout < Date.now()) return message.channel.send(`💨 \`${member.user.tag}\` is not being timed out!`);
    return message.channel.send(`💤 \`${member.user.id}\` has \`${msToTime(timeout - Date.now())}\` time left.`);
  }
};