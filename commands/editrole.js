module.exports = {
  description: "Edit a rolereward.",
  usage: {
    "<ID>": "The rolereward's ID.",
    "<property: role|mode|count|duration>": "The property you want to change.",
    "<value>": "The new value for the property. See the usage of `c!addrole` for values to choose from."
  },
  examples: {
    "MnRIf4 mode each": "Will change the rolereward with ID MnRIf4's mode to each.",
    "jPFj78 count 1337": "Will change the rolereward with ID jPFj78's count to 1337."
  },
  aliases: [ "=role" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let id = args[0], { roles } = await gdb.get();
  if (!roles[id]) return message.channel.send("❌ Invalid role. ")

  let property = args[1].toLowerCase();
  if (!["role", "mode", "count", "duration"].includes(property)) return message.channel.send("❌ Invalid property. For help, type `" + prefix + "help editrole`")

  let value;
  if (property == "role") {
    value = [
      message.guild.roles.find(r => r.name == args[2].replace("_", "")),
      message.guild.roles.get(args[2]),
      message.guild.roles.get(args[2].replace("<@&", "").replace(">", ""))
    ].find(r => r)
    if (!value) return message.channel.send("❌ Invalid role. For help, type `" + prefix + "help editrole`");
    else value = value.id
  } else if (property == "mode") {
    value = args[2].toLowerCase();
    if (!["each", "only", "score"].includes(value)) return message.channel.send("❌ Invalid mode. For help, type `" + prefix + "help editrole`");
  } else if (property == "count") {
    value = parseInt(args[2])
    if (!value) return message.channel.send("❌ Invalid count. For help, type `" + prefix + "help editrole`");
  } else if (property == "duration") {
    value = args[2].toLowerCase();
    if (!["temporary", "permanent"].includes(value)) return message.channel.send("❌ Invalid duration. For help, type `" + prefix + "help editrole`")
  }

  gdb.editRole(id, property, value)
    .then(() => message.channel.send("✅ Rolereward with ID `" + id + "` has been changed."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}