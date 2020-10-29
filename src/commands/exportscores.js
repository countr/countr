module.exports = {
  description: "Export scores to a JSON-file.",
  usage: {
    "<member(s ...)>|raw": "The member(s) you want to export the scores of."
  },
  examples: {
    "110090225929191424": "Export the score of user with ID 110090225929191424.",
    "@Promise#0001": "Export the score of user Promise#0001.",
    "110090225929191424 @Promise#0001": "Export the scores of user with ID 110090225929191424 and user Promise#0001.",
    "raw": "Export all scores raw."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
};

const { getMember } = require("../constants/index.js");

module.exports.run = async (message, args, gdb) => {
  if (args[0] == "raw") {
    const { users } = gdb.get(), amount = Object.keys(users).length;

    return message.channel.send(`✅ Exported ${amount == 1 ? "1 user" : `${amount} users`}.`, {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(users, null, 2)),
          name: `Countr Scores for ${message.guild.id}.json`
        }
      ]
    }).catch(() => message.channel.send("🆘 It doesn't look like I have permission to send files in this channel."));
  } else {
    let members = [];
    for (const arg of args) members.push(await getMember(arg, message.guild));
    members = members.filter(m => m);
    if (!members.length) return message.channel.send("❌ No members were found with your search.");

    const { users } = gdb.get(), exports = {};
    for (const member of members) exports[member.id] = users[member.id] || 0;

    return message.channel.send(`✅ Exported ${members.length == 1 ? "1 user" : `${members.length} users`}.`, {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(exports, null, 2)),
          name: `Countr Scores for ${message.guild.id}.json`
        }
      ]
    }).catch(() => message.channel.send("🆘 It doesn't look like I have permission to send files in this channel."));
  }
};