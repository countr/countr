module.exports = {
  description: "Export scores to a JSON-file.",
  usage: {
    "<member(s ...) and/or role(s ...)>|all": "The member(s) and/or role(s') member(s) you want to export the scores of."
  },
  examples: {
    "110090225929191424": "Export the score of user with ID 110090225929191424.",
    "@Promise#0001": "Export the score of user Promise#0001.",
    "110090225929191424 @Promise#0001": "Export the scores of user with ID 110090225929191424 and user Promise#0001.",
    "@Staff Server_Moderators": "Export the scores of all members of roles Staff and Server Moderators.",
    "110090225929191424 @Promise#0001 @Staff Server_Moderators": "Mix members and roles if you want to.",
    "all": "Export all scores."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  if (args[0] == "all") {
    const { users: exported } = await gdb.get();

    message.channel.send("✅ Here ya go!", {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(exported, null, 2)),
          name: ["Countr Exported Scores", message.guild.id, Date.now(), "json"].join(".")
        }
      ]
    }).catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Attach Files)"))
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

    const exported = {}, { users: scores } = await gdb.get();

    for (var member of members) exported[member.id] = scores[member.id] || 0;

    message.channel.send("✅ Here ya go!", {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(exported, null, 2)),
          name: ["Countr Exported Scores", message.guild.id, Date.now(), "json"].join(".")
        }
      ]
    }).catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Attach Files)"))
  }
}