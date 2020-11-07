module.exports = {
  description: "Add to a member's score (or multiple members' scores)",
  usage: {
    "<member(s ...)>": "The member(s) you want to add the score of",
    "<number>": "The number you want to add to the scores"
  },
  examples: {
    "110090225929191424 9999999": "Add 9999999 to user with ID 110090225929191424.",
    "@Promise#0001 1337": "Add 1337 to Promise#0001's score.",
    "110090225929191424 @Promise#0001 1000": "Add 1000 to user with ID 110090225929191424 and to Promise#0001."
  },
  aliases: [ "+score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2,
  allowInCountingChannel: true
};

const { getMember } = require("../constants/index.js");

module.exports.run = async (message, args, gdb) => {
  const addition = parseInt(args.pop());
  if (!addition) return message.channel.send("❌ Invalid number.");

  let members = [];
  for (const arg of args) members.push(await getMember(arg, message.guild));
  members = members.filter((m, i) => m && members.indexOf(m) == i);
  if (!members.length) return message.channel.send("❌ No members were found with your search.");

  const { users } = gdb.get();
  for (const member of members) {
    if (!users[member.id]) users[member.id] = addition;
    else users[member.id] += addition;
  }
  gdb.set("users", users);

  if (members.length == 1) return message.channel.send(`✅ Score of user \`${members[0].user.tag}\` has been changed.`);
  else return message.channel.send(`✅ Scores of ${members.map(m => `\`${m.user.tag}\``).join(", ")} (${members.length} total) have been changed.`);
};