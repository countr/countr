module.exports = {
  description: "Set a member's score (or multiple members' scores)",
  usage: {
    "<member(s ...)>": "The member(s) or members of role(s) you want to set the score of",
    "<score>": "The new score"
  },
  examples: {
    "110090225929191424 9999999": "Set score to 9999999 for user with ID 110090225929191424.",
    "@Promise#0001 1337": "Set score to 1337 for Promise#0001's score.",
    "110090225929191424 @Promise#0001 1000": "Set score to 1000 for user with ID 110090225929191424 and for Promise#0001."
  },
  aliases: [ "=score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2,
  allowInCountingChannel: true
};

const { getMember } = require("../constants/index.js");

module.exports.run = async (message, args, gdb) => {
  const newScore = parseInt(args.pop());
  if (!newScore) return message.channel.send("❌ Invalid number.");

  let members = [];
  for (const arg of args) members.push(await getMember(arg, message.guild));
  members = members.filter(m => m);
  if (!members.length) return message.channel.send("❌ No members were found with your search.");

  const { users } = gdb.get();
  for (const member of members) users[member.id] = newScore;
  gdb.set("users", users);

  if (members.length == 1) return message.channel.send(`✅ Score of user \`${members[0].user.tag}\` has been changed.`);
  else return message.channel.send(`✅ Scores of ${members.map(m => `\`${m.user.tag}\``).join(", ")} (${members.length} total) have been changed.`);
};