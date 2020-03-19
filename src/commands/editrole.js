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
  aliases: [ "=role", "editrolereward", "=rolereward" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3
}

const { modes, durations } = require("../utils/constants.js"), { getRole } = require("../utils/resolvers.js")

module.exports.run = async function(client, message, args, gdb, strings) {
  let id = args[0], {roles } = gdb.get();
  if (!roles[id]) return message.channel.send(`❌ ${strings.invalidRolereward} ${strings.commandHelp}`)

  let property = args[1].toLowerCase();
  if (!["role", "mode", "count", "duration"].includes(property)) return message.channel.send(`❌ ${strings.invalidProperty} ${strings.commandHelp}`)

  let value;
  switch (property) {
    case "role":
      const role = await getRole(args[2], message.guild);
      if (!role) return message.channel.send(`❌ ${strings.invalidRole} ${strings.commandHelp}`)
      value = role.id;
      break;
    case "mode":
      value = args[2].toLowerCase();
      if (!modes.includes(value)) return message.channel.send(`❌ ${strings.invalidMode} ${strings.commandHelp}`)
      break;
    case "count":
      value = parseInt(args[2]);
      if (!value) return message.channel.send(`❌ ${strings.invalidCount} ${strings.commandHelp}`)
      break;
    case "duration":
      value = args[2].toLowerCase();
      if (!durations.includes(value)) return message.channel.send(`❌ ${strings.invalidDuration}`)
      break;
  }

  return gdb.editRole(id, property, value)
    .then(() => message.channel.send(`✅ ${strings.savedRole.replace(/{{ID}}/g, id)}`))
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}