module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let notifications = await db.getNotifications(message.guild.id, message.author.id);

    if (Object.keys(notifications).length == 0) return message.channel.send("❌ You have no notifications in this server. Get help on how to make one, type \`" + config.prefix + "help notifyme\`");
    return message.channel.send("📋 User " + message.author.toString() + "\'s notifications in " + message.guild.name + ":\n" + formatNotifs(notifications))
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

module.exports.description = {
    "description": "Get a list of your notifications in the server.",
    "usage": {},
    "examples": {}
}

function formatNotifs(notifs) {
    let ntfs = [];
    for (var ID in notifs) ntfs.push("- \`" + ID + "\` " + (notifs[ID].mode == "each" ? "Every " + formatSuffix(notifs[ID].count) + "count" : "Only count number " + notifs[ID].count))
    return ntfs.join("\n");
}

function formatSuffix(count) {
    let str = count.toString();
    if (str == "1") return "";
    if (str.endsWith("1")) return str + "st ";
    if (str.endsWith("2")) return str + "nd ";
    if (str.endsWith("3")) return str + "rd ";
    return str + "th ";
}