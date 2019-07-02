const b64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"; // base64

module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let count = parseInt(args[0]);
    let mode = "only";
    if (args[1]) {
        count = parseInt(args[1]);
        mode = args[0].toLowerCase()
        if (!["each", "only"].includes(mode)) return message.channel.send(strings["INVALID_MODE"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help notifyme\`"));
    }
    if (!count) return message.channel.send("❌ " + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help notifyme\`"));

    let ID = randomizeID();
    while (await db.notificationExists(message.guild.id, ID)) ID = randomizeID();
    
    let botMsg = await message.channel.send("♨ Saving notification to database. Please wait.");

    db.setNotification(message.guild.id, ID, message.author.id, mode, count)
        .then(() => { botMsg.edit("✅ Saved notification to database. ID \`" + ID + "\`") })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 1

function randomizeID() {
    let id = "";
    for (var i = 0; i < 6; i++) id = id + b64[Math.floor(Math.random() * Math.floor(b64.length))]

    return id;
}