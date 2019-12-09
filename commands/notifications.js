module.exports = {
  description: "Get a list of your notifications in the server.",
  usage: {},
  examples: {},
  aliases: [ "notifs", "alert" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let notifications = await gdb.getNotifications(message.author.id);

  if (!Object.keys(notifications).length) return message.channel.send("❌ You don't have any notifications set up for this server!")
  return message.channel.send("📋 Notifications for user " + message.author + " in this server:\n" + formatNotifications(notifications))
}

function formatNotifications(notifications) {
  let ntfs = [];
  for (var ID in notifications) {
    let notif = notifications[ID], explanation;

    if (notif.mode == "each") explanation = "Every " + formatNumberSuffix(notif.count) + " count notifies you"
    else if (notif.mode == "only") explanation = "Only count " + notif.count + " notifies you"

    ntfs.push("- \`" + ID + "\` " + explanation)
  }
  return ntfs.join("\n")
}

function formatNumberSuffix(number) {
  let str = number.toString()

  if (str == 1) return ""; // instead of "Every 1st count", we say "Every count"

  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return str + "th " // ex. eleventh instead of elevenst

  if (str.endsWith("1")) return str + "st "; // ends on first
  if (str.endsWith("2")) return str + "nd "; // ends on second
  if (str.endsWith("3")) return str + "rd "; // ends on third
  return str + "th " // ends on fourth, fifth, sixth etc.
}