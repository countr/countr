module.exports = {
  description: "Reset a member's or multiple members' score.",
  usage: {
    "<member(s ...) and/or role(s ...)>|all": "The member(s) and/or role(s') member(s) you want to reset the score of, or all. Role names have to have underscores instead of spaces."
  },
  examples: {
    "110090225929191424": "Remove the score of user with ID 110090225929191424.",
    "@Promise#0001": "Remove the score of user Promise#0001.",
    "110090225929191424 @Promise#0001": "Remove the scores of user with ID 110090225929191424 and user Promise#0001.",
    "@Staff Server_Moderators": "Remove the scores of all members of roles Staff and Server Moderators.",
    "110090225929191424 @Promise#0001 @Staff Server_Moderators": "Mix members and roles if you want to."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  if (args[0] == "all") {
    const { users: backup } = await gdb.get();

    gdb.set("users", {})
    .then(() => message.channel.send("✅ Scores for all members have been reset. Here's a backup incase you need it. Import the scores back with \`" + prefix + "importscores\`.", {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(backup, null, 2)),
          name: ["Countr Scores Backup", message.guild.id, Date.now(), "json"].join(".")
        }
      ]
    }))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  } else {
    const members = [];
    for (var arg of args) {
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

    const backup = {}, newScores = {}, { users: scores } = await gdb.get();

    for (var member of members) {
      backup[member.id] = scores[member.id] || 0;
      newScores[member.id] = 0;
    }

    gdb.importScores(newScores, "set")
      .then(() => message.channel.send("✅ " + (members.length > 1 ? "Scores of " + members.length + " members have" : "Score of 1 member have") + " been reset."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  }
}