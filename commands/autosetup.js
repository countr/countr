module.exports = {
  description: "Quickly set up a counting channel.",
  usage: {},
  examples: {},
  aliases: [ "setup" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  message.guild.createChannel("counting", { type: "text", rateLimitPerUser: 2, parent: message.channel.parent })
    .then(ch => {
      gdb.setMultiple({
        channel: ch.id,
        count: 0,
        user: "",
        message: message.id
      })
        .then(() => message.channel.send("✅ Enjoy " + ch + "! Keep in mind commands inside the counting channel will not work, and these commands has to be outside of the counting channel."))
        .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
    })
    .catch(() => message.channel.send("❌ An unknown error occurred. Do I have permission?"))
}