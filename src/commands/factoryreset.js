module.exports = {
  description: "Reset all data Countr has stored about this server.",
  usage: {},
  examples: {},
  aliases: [],
  permissionRequired: 3, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, gdb, strings) {
  let botMsg = await message.channel.send(`‼️ **${strings.factoryResetStage1}**`)
  try {
    await botMsg.react("❌");
    await botMsg.react("✅")
  } catch(e) {
    return botMsg.edit(`🆘 ${strings.permissionError} (Add Reactions)`)
  }

  let stage = 2;
  while (stage) try {
    let collected = await botMsg.awaitReactions((reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id == message.author.id, { errors: [ "time" ], time: 30000, maxEmojis: 1 }), reaction = collected.first();
    if (reaction.emoji == "❌") return botMsg.edit(`🔰 ${strings.cancelledByUser} ${strings.runAgain}`) && botMsg.reactions.removeAll().catch();
    else if (reaction.emoji == "✅") {
      stage -= 1;
      if (stage) botMsg.edit(`⁉️ **${stings.factoryResetStage2}**`) && reaction.users.remove(message.author.id).catch();
    }
  } catch(e) {
    return botMsg.edit(`⏲️ ${strings.timedOut} ${strings.runAgain}`) && botMsg.reactions.removeAll().catch();
  }

  botMsg.reactions.removeAll().catch();

  gdb.factoryReset()
    .then(() => botMsg.edit(`☠️ ${strings.factoryResetStage3}`))
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}