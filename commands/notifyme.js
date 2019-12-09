module.exports = {
  description: "Get a notification whenever the server reach whatever count you want.",
  usage: {
    "[each]": "If you include this, it will be each <count>.",
    "<count>": "The count you want to get notified of."
  },
  examples: {
    "each 1000": "Get notified for every 1000th count, including 2000 and 3000.",
    "420": "Get notified whenever the server reach count 420."
  },
  aliases: [ "alertme" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1 || args.length == 2
}

const { generateID } = require("../database.js");

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let mode = "only", count;
  if (args[1]) {
    count = parseInt(args[1]);
    mode = args[0].toLowerCase()
    if (mode !== "each") return message.channel.send("❌ Invalid argument \`" + mode + "\`. For help, type `" + prefix + "help notifyme`")
  } else count = parseInt(args[0])

  if (!count) return message.channel.send("❌ Invalid count. For help, type `" + prefix + "help notifyme`")

  let notifications = await gdb.getNotifications(message.author.id), ID = generateID(Object.keys(notifications))

  gdb.setNotification(ID, message.author.id, mode, count)
    .then(() => message.channel.send("✅ Notification with ID \`" + ID + "\` is now saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occoured. Please try again, or contact support."))
}