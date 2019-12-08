module.exports = {
  description: "Edit a pintrigger.",
  usage: {
    "<ID>": "The pintrigger's ID.",
    "<property: mode|count|action>": "The property you want to change.",
    "<value: see addpin's usage>": "The new value for the property."
  },
  examples: {
    "wnoK3d mode each": "Will change the pintrigger with ID wnoK3d's mode to each.",
    "89hJzm count 1337": "Will change the pintrigger with ID 89hJzm's count to 1337."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let id = args[0], { pins } = await gdb.get();
  if (!pins[id]) return message.channel.send("❌ Invalid pintrigger. For help, type `" + prefix + "help editpin`")

  let property = args[1].toLowerCase()
  if (!["mode", "count", "action"].includes(property)) return message.channel.send("❌ Invalid property. For help, type `" + prefix + "help editpin`")

  let value;
  if (property == "mode") {
    value = args[2].toLowerCase();
    if (!["each", "only", "score"].includes(value)) return message.channel.send("❌ Invalid mode. For help, type `" + prefix + "help editpin`")
  } else if (property == "count") {
    value = parseInt(args[2]);
    if (!value) return message.channel.send("❌ Invalid count. For help, type `" + prefix + "help editpin`")
  } else if (property == "action") {
    value = args[2].toLowerCase();
    if (!["keep", "repost"].includes(value)) return message.channel.send("❌ Invalid action. For help, type `" + prefix + "help editpin`")
  }

  gdb.editPin(id, property, value)
    .then(() => message.channel.send("✅ Pin trigger with ID `" + id + "` has now been changed."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occoured. Please try again, or contact support."))
}