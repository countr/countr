  
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
  checkArgs: (args) => args.length == 1,
  allowInCountingChannel: true
};

module.exports.run = async (message, [ notifID ], gdb, { permissionLevel }) => {
  const { notifications } = gdb.get();
  if (notifID == "all") {
    const newNotifications = {};
    for (const nID in notifications) if (
      notifications[nID] &&
      notifications[nID].user !== message.author.id
    ) newNotifications[nID] = notifications[nID];
    gdb.set("notifications", newNotifications);
    return message.channel.send("✅ All your notifications have been removed.");
  } else {
    if (
      !notifications[notifID] ||
      (
        notifications[notifID].user !== message.author.id &&
        permissionLevel < 1
      )
    ) return message.channel.send("❌ Notification not found.");

    gdb.removeFromObject("notifications", notifID);
    return message.channel.send(`✅ Notification \`${notifID}\` has been removed.`);
  }
};