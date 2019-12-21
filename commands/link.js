module.exports = {
  description: "Link a counting channel manually.",
  usage: {
    "[<channel>]": "The new counting channel."
  },
  examples: {},
  aliases: [ "connect" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 0 || args.length == 1
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let channel = message.channel;

  if (args[0]) channel = [
    message.guild.channels.find(c => c.name == args[0])
  ].find(c => c)

  if (!channel) return message.channel.send("❌ Invalid channel. For help, type `" + prefix + "help link`")

  gdb.set("channel", channel.id)
    .then(() => message.channel.send("✅ The channel has been linked! Keep in mind commands inside the counting channel will not work, and these commands has to be outside of the counting channel."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}