module.exports = {
  description: "Remove from a member's score",
  usage: {
    "<member(s ...) and/or role(s ...)>": "The member(s) or members of role(s) you want to remove from the score(s) of",
    "<score>": "The new score"
  },
  examples: {
    "110090225929191424 5": "Will remove 5 counts from the score of the member with ID 110090225929191424.",
    "@Promise#0001 @CountingGods 100": "Will remove 100 counts from the scores of Promise#0001 and all members with role Counting Gods."
  },
  aliases: [ "-fromscore", "-score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const removeFromScore = parseInt(args.pop());
  if (!removeFromScore) return message.channel.send("❌ Invalid score. For help, type `" + prefix + "help removefromscore`")

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

  const removeFromScores = {}

  for (const member of members) removeFromScores[member.id] = -removeFromScore;

  gdb.importScores(removeFromScores, "add")
    .then(() => message.channel.send("✅ " + (members.length > 1 ? "Score of " + members.length + " members" : "Score of 1 member") + " has been given new values."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}
