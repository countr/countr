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
  aliases: [ "=score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const newScore = parseInt(args.pop())
  if (!newScore) return message.channel.send("❌ Invalid score. For help, type `" + prefix + "help setscore`")

  const members = [];
  for (const arg of args) {
    let search = arg.split("_").join(" "), obj = [
      message.guild.members.find(m => search == m.user.tag),
      message.guild.members.get(search.replace("<@", "").replace("!", "").replace(">", "")),
      message.guild.roles.find(r => r.name == search),
      message.guild.roles.get(search.replace("<&", "").replace(">", ""))
    ].find(o => o)

    if (obj) {
      if (obj.members) obj.members.forEach(m => members.push(m))
      else members.push(obj)
    }
  }

  const newScores = {}

  for (const member of members) newScores[member.id] = newScore;

  gdb.importScores(newScores, "set")
    .then(() => message.channel.send("✅ " + (members.length > 1 ? "Score of " + members.length + " members" : "Score of 1 member") + " has been set to " + newScore + "."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}