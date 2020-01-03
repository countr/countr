module.exports = {
  description: "Reset all data Countr has stored about this server.",
  usage: {},
  examples: {},
  aliases: [],
  permissionRequired: 3, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let botMsg = await message.channel.send("‼️ **Are you sure you want to delete all data Countr has on this server?**"), stage = 2;
  try {
    await botMsg.react("❌");
    await botMsg.react("✅");
  } catch(e) {
    return botMsg.edit("🆘 An unknown error occurred. Do I have permission? (Add Reactions, Manage Messages)")
  }

  while (stage) try {
    let collected = await botMsg.awaitReactions((reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id == message.author.id, { errors: [ "time" ], time: 30000, maxEmojis: 1 })
    let reaction = collected.first();
    if (reaction.emoji == "❌") return botMsg.edit("🔰 Cancelled by user. Run it again with `" + prefix + "factoryreset`.") && botMsg.clearReactions().catch();
    else if (reaction.emoji == "✅") {
      stage -= 1;
      if (stage) botMsg.edit("⁉️ **ARE YOU REALLY SURE?? We will not be able to recover anything of it if you do this!**") && reaction.remove(message.author.id).catch();
    }
  } catch(e) {
    return botMsg.edit("⏲️ Timed out. Run it again with `" + prefix + "factoryreset`.") && botMsg.clearReactions().catch();
  }

  botMsg.clearReactions().catch();

  gdb.factoryReset()
    .then(() => botMsg.edit("☠️ All data is now reset to the default. Keep in mind the prefix is also reset."))
    .catch(e => console.log(e) && botMsg.edit("🆘 An unknown database error occurred. Please try again, or contact support."))
}