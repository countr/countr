module.exports = {
  description: "Add a regex filter for the talking module, filtering unwanted chats.",
  usage: {
    "<regex ...>": "The regex you want to filter out of the chat. Get info on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices"
  },
  examples: {
    "duck|poop": "Will filter out all messages containing duck and/or poop.",
    "[A-Z]": "Will filter out all messages with capital letters.",
    "[A-Ca-cX-Zx-z]": "Will filter out A, B, C, X, Y, Z - regardless if it's capital or not."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

const { generateID } = require("../database.js")

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let regex = args.join(" ");
  if (!testRegex(regex)) return message.channel.send("❌ Invalid regex. For help, type `" + prefix + "help addregex`")

  gdb.addRegex(regex)
    .then(() => message.channel.send("✅ Regex `" + regex + "` is now saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occoured. Please try again, or contact support."))
}

function testRegex(regex) {
  try {
    return new RegExp(regex, "g");
  } catch(e) {
    return false;
  }
}