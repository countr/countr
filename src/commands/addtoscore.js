module.exports = {
  description: "Set a member's score",
  usage: {
    "<member(s ...) and/or role(s ...)>": "The member(s) or members of role(s) you want to set the score of",
    "<score>": "The new score"
  },
  examples: {
    "110090225929191424 9999999": "Will set member with ID 110090225929191424's score to 9999999.",
    "@Promise#0001 @CountingGods 1337": "Will set Promise#0001's and all members in role Counting Gods' score to 1337."
  },
  aliases: [ "+score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2
}

const { getRole, getMember } = require("../constants/resolvers.js")

module.exports.run = async function(client, message, args, gdb, strings) {
  const addition = parseInt(args.pop());
  if (!addition) return message.channel.send(`❌ ${strings.invalidScore} ${strings.commandHelp}`)

  message.channel.startTyping().catch(); // we indicate that we are working on it. We do this because we might need to fetch members and/or roles in the process.

  const members = [];
  for (const search of args) {
    const role = await getRole(search, message.guild);
    
    if (role) obj.members.forEach(m => members.push(m)); // fetching roles is less time consuming than fetching members, that's why we try with a role first.
    else {
      const member = await getMember(search, message.guild);
      if (member) members.push(member);
    }
  }

  const additions = {}
  for (const member of members) additions[member.id] = addition;

  return gdb.importScores(additions, "add")
    .then(() => message.channel.send(`✅ ${members.length == 1 ? strings.savedScoresSingular : strings.savedScoresPlural.replace(/{{MEMBERS}}/g, members.length)}`) && message.channel.stopTyping())
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}