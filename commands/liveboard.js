module.exports = {
  description: "Set up a liveboard in your server. (Premium)",
  usage: {
    "[<channel>]": "Specify what channel you want the liveboard message to go in. Default is current channel."
  },
  examples: {},
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: () => true // (args) => args.length <= 1
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  message.channel.send("🔰 This is a premium-only feature and also requires the premium bot to work properly!")
}