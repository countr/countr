module.exports = {
  description: "Run JavaScript code.",
  usage: {
    "<code ...>": "The JavaScript code you'd like to run. This is DANGEROUS, so only use it if you know what you're doing. Never run any code from people you don't trust."
  },
  examples: {},
  aliases: ["evaluate"],
  permissionRequired: 5, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, gdb, strings, { content }) {
  try {
    let evaled = eval(content);
    if (typeof evaled != "string") evaled = require("util").inspect(evaled);
    message.channel.send(`🆗 Evaluated successfully.\n\`\`\`js\n${evaled}\`\`\``)
  } catch(e) {
    if (typeof e == "string") e = e.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
    message.channel.send(`🆘 JavaScript failed.\n\`\`\`fix\n${e}\`\`\``)
  }
}