module.exports = {
  description: "Add a pintrigger so big milestones gets pinned in chat. Keep in mind this will only accept 50 pins because of Discord's limit.",
  usage: {
    "<mode: each|only>": "If you use each, it will pin every <count> count. If you use only, it will only pin count <count>.",
    "<count>": "The count you want to reference in your mode.",
    "[<action: keep|repost>]": "If you use repost, it will repost the message before pinning it. Default is keep, which does not do this."
  },
  examples: {
    "each 1000 repost": "Will pin every 1000th count after reposting it, including 2000 and 3000 etc.",
    "only 420": "Will pin the count 1337 as-is."
  },
  aliases: [ "+pin" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 2 || args.length == 3
}

const { generateID } = require("../database.js")

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let mode = args[0].toLowerCase();
  if (![ "each", "only" ].includes(mode)) return message.channel.send("❌ Invalid mode. For help, type `" + prefix + "help addpin`")

  let count = parseInt(args[1]);
  if (!count) return message.channel.send("❌ Invalid count. For help, type `" + prefix + "help addpin`")

  let action = (args[2] || "keep").toLowerCase()
  if (![ "keep", "repost" ].includes(action)) return message.channel.send("❌ Invalid action. For help, type `" + prefix + "help addpin`")

  let { pins: alreadyGeneratedPins } = await gdb.get(), id = generateID(Object.keys(alreadyGeneratedPins))
  gdb.setPin(id, mode, count, action)
    .then(() => message.channel.send("✅ Pintrigger with ID `" + id + "` has been saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}