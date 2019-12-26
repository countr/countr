module.exports = {
  description: "Remove a regex filter.",
  usage: {
    "<regex ...>|all": "The regex filter you want to remove, or all regex filters."
  },
  examples: {
    "duck|poop": "Remove the regex filter `duck|poop`.",
    "all": "Remove all regex filters."
  },
  aliases: [ "-regex" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let filter = args.join(" "), { regex: filters } = await gdb.get();

  if (filter == "all") {
    gdb.set("regex", [])
      .then(() => message.channel.send("✅ All regex filters have been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  } else {
    if (!filters.includes(filter)) return message.channel.send("❌ Regex filter not found. For help, tyoe `" + prefix + "help removeregex`")

    gdb.removeRegex(filter)
      .then(() => message.channel.send("✅ Regex filter `" + filter + "` have been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  }
}