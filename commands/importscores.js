module.exports = {
  description: "Import scores from a JSON-file. Upload the JSON-file with the command itself.",
  usage: {
    "<method: set|add>": "Decide if you want to overwrite the scores or add to the scores."
  },
  examples: {
    "set": "Will overwrite all the scores to the one in the file.",
    "add": "Will add the scores to the users' previous scores."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1
}

const fetch = require("node-fetch")

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const method = args[0]
  if (!["set", "add"].includes(method)) return message.channel.send("❌ Invalid method. For help, type `" + prefix + "help importscores`")

  if (!message.attachments.size) return message.channel.send("❌ No file attached. For help, type `" + prefix + "help importscores`")

  const file = message.attachments.first()
  if (!file.filename.endsWith(".json")) return message.channel.send("❌ Invalid file attached. For help, type `" + prefix + "help importscores`")

  const content = await fetch(file.url).then(res => res.json()).catch(() => false)
  if (!content || typeof content !== "object" || !Object.keys(content).length || Object.keys(content).filter(u => !parseInt(u)).length !== 0 || Object.values(content).filter(s => typeof s !== "number").length !== 0 || Object.values(content).find(s => s < 0))
    return message.channel.send("❌ Invalid JSON-file attached. For help, type `" + prefix + "help importscores`")

  gdb.importScores(content, method)
    .then(() => message.channel.send("✅ Successfully imported " + Object.keys(content).length + " users' scores."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}