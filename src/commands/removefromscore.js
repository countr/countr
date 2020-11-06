module.exports = {
  description: "Remove from a member's score",
  usage: {
    "<member(s ...)>": "The member(s) you want to remove from the score(s) of",
    "<number>": "The number of counts to remove"
  },
  examples: {
    "110090225929191424 5": "Will remove 5 counts from the score of the member with ID 110090225929191424.",
    "@Promise#0001 462870395314241537 100": "Will remove 100 counts from the scores of Promise#0001 and the member with ID 462870395314241537."
  },
  aliases: [ "-fromscore", "-score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2,
  allowInCountingChannel: true
};

const { getMember } = require("../constants/index.js");

module.exports.run = async (message, args, gdb) => {
  const subtraction = parseInt(args.pop());
  if (!subtraction) return message.channel.send("❌ Invalid number.");

  let members = [];
  for (const arg of args) members.push(await getMember(arg, message.guild));
  members = members.filter(m => m);
  if (!members.length) return message.channel.send("❌ No members were found with your search.");

  const { users } = gdb.get();
  for (const member of members) {
    if (!users[member.id]) users[member.id] = 0;
    else users[member.id] -= subtraction;
    if (users[member.id] < 0) users[member.id] = 0;
  }
  gdb.set("users", users);

  if (members.length == 1) return message.channel.send(`✅ Score of user \`${members[0].user.tag}\` has been changed.`);
  else return message.channel.send(`✅ Scores of ${members.map(m => `\`${m.user.tag}\``).join(", ")} (${members.length} total) have been changed.`);
};
