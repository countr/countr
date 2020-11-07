module.exports = {
  description: "Reset a member's score (or multiple members' scores)",
  usage: {
    "<member(s ...)>|all": "The member(s) you want to add the score of, or all."
  },
  examples: {
    "110090225929191424": "Reset score of user with ID 110090225929191424.",
    "@Promise#0001": "Reset score of Promise#0001.",
    "110090225929191424 @Promise#0001": "Reset score of user with ID 110090225929191424 and Promise#0001.",
    "all": "Reset all scores."
  },
  aliases: [ "re=score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length,
  allowInCountingChannel: true
};

const { getMember } = require("../constants/index.js");

module.exports.run = async (message, args, gdb) => {
  if (args[0] == "all") {
    gdb.set("users", {});
    return message.channel.send("✅ All scores have been reset.");
  } else {
    let members = [];
    for (const arg of args) members.push(await getMember(arg, message.guild));
    members = members.filter(m => m);
    if (!members.length) return message.channel.send("❌ No members were found with your search.");

    let { users } = gdb.get();
    for (const member of members) delete users[member.id];
    gdb.set("users", users);

    if (members.length == 1) return message.channel.send(`✅ Score of user \`${members[0].user.tag}\` has been reset.`);
    else return message.channel.send(`✅ Scores of ${members.map(m => `\`${m.user.tag}\``).join(", ")} (${members.length} total) have been reset.`);
  }
};