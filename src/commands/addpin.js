module.exports = {
  description: "Add a pintrigger so big milestones gets pinned in chat.",
  usage: {
    "<mode: each|only>": "If you use each, it will pin every <count> count. If you use only, it will only pin count <count>.",
    "<count>": "The count you want to reference in your mode.",
    "[repost]": "If you include this, it will repost the message before pinning it."
  },
  examples: {
    "each 1000 repost": "Will pin every 1000th count after reposting it, including 2000 and 3000 etc.",
    "only 420": "Will pin the count 1337 as-is."
  },
  aliases: [ "+pin", "addpintrigger", "+pintrigger" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 2 || args.length == 3
}

const { modes, actions } = require("../utils/constants.js").pintrigger, { generateID } = require("../database.js")

module.exports.run = async function(client, message, args, gdb, strings) {
  let mode = args[0].toLowerCase();
  if (!modes.includes(mode)) return message.channel.send(`❌ ${strings.invalidMode} ${strings.commandHelp}`)

  let count = parseInt(args[1]);
  if (!count) return message.channel.send(`❌ ${strings.invalidCount} ${strings.commandHelp}`)

  let action = (args[2] || "keep").toLowerCase();
  if (!actions.includes(action)) return message.channel.send(`❌ ${strings.invalidAction} ${strings.commandHelp}`)

  let { pins } = gdb.get(), id = generateID(Object.keys(pins));
  return gdb.setPin(id, mode, count, action)
    .then(() => message.channel.send(`✅ ${strings.savedPin.replace(/{{ID}}/g, id)}`))
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}