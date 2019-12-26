module.exports = {
  description: "Remove a pintrigger.",
  usage: {
    "<ID(s ...)>|all": "The pintrigger ID(s) you want to remove, or all pintriggers."
  },
  examples: {
    "v43ThQ": "Remove pintrigger with ID v43ThQ.",
    "all": "Remove all pintriggers."
  },
  aliases: [ "-pin" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const id = args[0], { pins } = await gdb.get();

  if (id == "all") {
    gdb.set("pins", {})
      .then(() => message.channel.send("✅ All pintriggers have been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  } else {
    if (!pins[id]) return message.channel.send("❌ Pintrigger not found. For help, tyoe `" + prefix + "help removepin`")

    gdb.setPin(id, null)
      .then(() => message.channel.send("✅ Pintrigger with ID `" + id + "` has been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  }
}