module.exports = {
  description: "Edit a pintrigger.",
  usage: {
    "<ID>": "The pintrigger's ID.",
    "<property: mode|count|action>": "The property you want to change.",
    "<value>": "The new value for the property. See the usage of `c!addpin` for values to choose from."
  },
  examples: {
    "wnoK3d mode each": "Will change the pintrigger with ID wnoK3d's mode to each.",
    "89hJzm count 1337": "Will change the pintrigger with ID 89hJzm's count to 1337.",
    "IfS80j action repost": "Will change the pintrigger with ID IfS80j's action to repost."
  },
  aliases: [ "=pin" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3
}

module.exports.run = async function(client, message, args, gdb, strings) {
  let id = args[0], { pins } = gdb.get();
  if (!pins[id]) return message.channel.send(`❌ ${strings.invalidPin} ${strings.commandHelp}`)

  let property = args[1].toLowerCase();
  if (!["mode", "count", "action"].includes(property)) return message.channel.send(`❌ ${strings.invalidProperty} ${strings.commandHelp}`)

  let value;
  switch (property) {
    case "mode":
      value = args[2].toLowerCase();
      if (!["each", "only"].includes(value)) return message.channel.send(`❌ ${strings.invalidMode} ${strings.commandHelp}`)
      break;
    case "count":
      value = parseInt(args[2]);
      if (!value) return message.channel.send(`❌ ${strings.invalidCount} ${strings.commandHelp}`)
      break;
    case "action":
      value = args[2].toLowerCase();
      if (!["keep", "repost"].includes(value)) return message.channel.send(`❌ ${strings.invalidAction} ${strings.commandHelp}`)
      break;
  }

  return gdb.editPin(id, property, value)
    .then(() => message.channel.send(`✅ ${strings.savedPin.replace(/{{ID}}/g, id)}`))
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}