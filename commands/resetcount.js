module.exports = {
  description: "Reset the count.",
  usage: {},
  examples: {},
  aliases: [ "re=count" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  gdb.setMultiple({
    count: 0,
    user: "",
  })
    .then(() => message.channel.send("✅ The count has now been reset."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}