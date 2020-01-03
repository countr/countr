module.exports = {
  description: "Remove a rolereward.",
  usage: {
    "<ID(s ...)>|all": "The rolereward ID(s) you want to remove, or all."
  },
  examples: {
    "bd9kJK": "Remove rolereward with ID bd9kJK.",
    "all": "Remove all rolerewards."
  },
  aliases: [ "-role" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const id = args[0], { roles } = await gdb.get();

  if (id == "all") {
    gdb.set("roles", {})
      .then(() => message.channel.send("✅ All rolerewards have been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  } else {
    if (!roles[id]) return message.channel.send("❌ Rolereward not found. For help, tyoe `" + prefix + "help removerole`")

    gdb.setRole(id, null)
      .then(() => message.channel.send("✅ Rolereward with ID `" + id + "` has been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  }
}