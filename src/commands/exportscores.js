module.exports = {
  description: "Export scores to a JSON-file.",
  usage: {
    "<member(s ...)>|members|raw": "The member(s) you want to export the scores of."
  },
  examples: {
    "110090225929191424": "Export the score of user with ID 110090225929191424.",
    "@Promise#0001": "Export the score of user Promise#0001.",
    "110090225929191424 @Promise#0001": "Export the scores of user with ID 110090225929191424 and user Promise#0001.",
    "110090225929191424 @Promise#0001 @Staff Server_Moderators": "Mix members and roles if you want to.",
    "members": "Export all scores of all the members in this server.",
    "raw": "Export all scores raw."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

const { getRole, getMember } = require("../constants/resolvers.js")

module.exports.run = async function(client, message, args, gdb, strings) {
  if (args[0] == "raw") {
    const { users } = gdb.get(), amount = Object.keys(users).length;

    return message.channel.send(`✅ ${amount == 1 ? strings.exportedScoresSingular : strings.exportedScoresPlural.replace(/{{USERS}}/g, amount)}`, {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(users, null, 2)),
          name: `Countr Scores.${message.guild.id}.${Date.now()}.json`
        }
      ]
    }).catch(() => message.channel.send(`🆘 ${strings.permissionError} (Attach Files)`))
  } else if (args[0] == "members") {
    const members = await message.guild.members.fetch(), { users } = gdb.get(), exported = {};
    for (const member of members.array()) exported[member.id] = users[member.id] || 0

    return message.channel.send(`✅ ${strings.exportedScoresPlural.replace(/{{USERS}}/g, members.size)}`, {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(exported, null, 2)),
          name: `Countr Scores.${message.guild.id}.${Date.now()}.json`
        }
      ]
    })
  } else {
    const hits = await Promise.all(args.map(async search => await getRole(search, message.guild) || await getMember(search, message.guild))), { users } = gdb.get(), exported = {};
    for (const hit of hits) {
      if (hit.members) for (const member of hit.members.array()) exported[member.id] = users[member.id] || 0;
      else exported[hit.id] = users[hit.id] || 0;
    }

    const amount = Object.keys(exported).length;

    return message.channel.send(`✅ ${amount == 1 ? strings.exportedScoresSingular : strings.exportedScoresPlural.replace(/{{USERS}}/g, amount)}`, {
      files: [
        {
          attachment: Buffer.from(JSON.stringify(exported, null, 2)),
          name: `Countr Scores.${message.guild.id}.${Date.now().json}`
        }
      ]
    }).catch(() => message.channel.send(`🆘 ${strings.permissionError} (Attach Files)`))
  }
}