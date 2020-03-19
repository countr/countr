module.exports = {
  description: "Quickly set up a counting channel.",
  usage: {},
  examples: {},
  aliases: [ "setup" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, gdb, strings) {
  message.guild.channels.create("counting", {
    parent: message.channel.parent,
    rateLimitPerUser: 2,
    permissionOverwrites: [
      {
        id: client.user.id,
        allow: require("discord.js").Permissions.FLAGS // give Countr all permissions
      }
    ]
  })
    .then(ch => gdb.set({
      channel: ch.id,
      count: 0,
      user: "",
      message: message.id
    })
      .then(() => message.channel.send(`✅ ${strings.enjoyCounting.replace(/{{CHANNEL}}/g, ch)}`))
      .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
    )
    .catch(() => message.channel.send(`❌ ${strings.permissionError}`))
}