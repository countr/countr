module.exports = {
  description: "Reset and disable the timeout role.",
  usage: {},
  examples: {},
  aliases: [ "resettimeoutrole", "re=timeoutrole" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, gdb, strings) {
  gdb.set("timeoutrole", {})
    .then(() => message.channel.send(`✅ ${strings.disabledTimeout}`))
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}