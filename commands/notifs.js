module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let notifications = await db.getNotifications(message.guild.id, message.author.id);

    if (Object.keys(notifications).length == 0) return message.channel.send("❌ " + strings["NO_NOTIFS"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help notifyme\`"));
    return message.channel.send("📋 " + strings["USER_NOTIFS"].replace("{{USER}}", message.author.toString()).replace("{{GUILD}}", message.guild.name) + ":\n" + formatNotifs(notifications, strings))
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

function formatNotifs(notifs, strings) {
    let ntfs = [];
    for (var ID in notifs) ntfs.push("- \`" + ID + "\` " + (notifs[ID].mode == "each" ? strings["EVERY_X_COUNT"].replace("{{NUMBER}}", formatSuffix(notifs[ID].count, strings)) : strings["ONLY_X"].replace("{{NUMBER}}", notifs[ID].count)))
    return ntfs.join("\n");
}

function formatSuffix(count, strings) {
    let str = count.toString();
    if (str == "1") return "";
    if (str.endsWith("1")) return strings["NUM_ST"].replace("{{NUM}}", str);
    if (str.endsWith("2")) return strings["NUM_ND"].replace("{{NUM}}", str);
    if (str.endsWith("3")) return strings["NUM_RD"].replace("{{NUM}}", str);
    return strings["NUM_TH"].replace("{{NUM}}", str);
}