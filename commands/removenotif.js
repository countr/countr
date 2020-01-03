module.exports = {
  description: "Remove a notification.",
  usage: {
    "<ID(s ...)>|all": "The notification ID(s) you want to remove, or all notifications."
  },
  examples: {
    "bd9kJK": "Remove notification with ID bd9kJK.",
    "all": "Remove all notifications."
  },
  aliases: [ "-notif" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const id = args[0], { notifications } = await gdb.get();

  if (id == "all") {
    const newNotifications = {}
    for (let ID in notifications) if (notifications[ID] && notifications[ID].user !== message.author.id) newNotifications[ID] = notifications[ID]
    gdb.set("notifications", newNotifications)
      .then(() => message.channel.send("✅ All notifications have been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  } else {
    if (!notifications[id]) return message.channel.send("❌ Notification not found. For help, tyoe `" + prefix + "help removenotif`")
    if (notifications[id].user !== message.author.id && permissionLevel == 0) return message.channel.send("❌ You do not own this notification! For help, tyoe `" + prefix + "help removenotif`")

    gdb.setNotification(id, null)
      .then(() => message.channel.send("✅ Notification with ID `" + id + "` has been removed."))
      .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
  }
}