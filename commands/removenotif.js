module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let ID = args[0];
    let notifications = await db.getNotifications(message.guild.id, message.author.id);
    if (!Object.keys(notifications).includes(ID)) return message.channel.send("❌ " + strings["NOTIF_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + config.prefix + "help removenotif\`"));

    let botMsg = await message.channel.send("♨ " + strings["REMOVING_NOTIF"]);

    db.setNotification(message.guild.id, ID, false)
        .then(() => { botMsg.edit("✅ " + strings["REMOVED_NOTIF"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 1