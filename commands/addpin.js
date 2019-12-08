module.exports = {
  description: "Add a pintrigger so big milestones gets pinned in chat. Keep in mind this will only accept 50 pins de to Discord's limit.",
  usage: {
    "<mode: each|only>": "If you use each, it will pin every <count> count. If you use only, it will only pin count <count>.",
    "<count>": "The count you want to reference in your mode.",
    "[repost]": "If you use this, it will repost the message meaning they won't be able to edit it in the future and potentially advertise in pinned messages."
  },
  examples: {
    "each 1000 repost": "Will pin every 1000th count after reposting it, including 2000 and 3000 etc.",
    "only 420": "Will pin the count 1337 as-is."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3 || args.length == 4
}

const modes = [ "each", "only" ], { generateID } = require("../database.js")

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let mode = args[0].toLowerCase();
  if (!modes.includes(mode)) return message.channel.send("❌ Invalid mode. For help, type `" + prefix + "help addpin`")

  let count = parseInt(args[1]);
  if (!count) return message.channel.send("❌ Invalid count. For help, type `" + prefix + "help addpin`")

  let action = args[2].toLowerCase()
  if (action && action !== "repost") return message.channel.send("❌ Invalid action. For help, type `" + prefix + "help addpin`")

  let { pins: alreadyGeneratedPins } = await gdb.get(), id = generateID(Object.keys(alreadyGeneratedPins))
  gdb.setPin(id, mode, count, action)
    .then(() => message.channel.send("✅ Pin trigger with ID `" + id + "` now saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occoured. Please try again, or contact support."))
}