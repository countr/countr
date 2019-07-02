const b64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"; // base64

module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let mode = args[0].toLowerCase();
    if (!["each", "only"].includes(mode)) return message.channel.send("❌ " + strings["INVALID_MODE"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addpin\`"));

    let count = parseInt(args[1]);
    if (!count) return message.channel.send("❌ " + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addpin\`"));

    let action = args[2].toLowerCase();
    if (!["keep", "repost"].includes(action)) return message.channel.send("❌ " + strings["INVALID_ACTION"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addpin\`"));

    let ID = randomizeID();
    while (await db.pinExists(message.guild.id, ID)) ID = randomizeID(); // we don't want to override an existing pin by accident.
    
    let botMsg = await message.channel.send("♨ " + strings["SAVING_PINTRIGGER"]);

    db.setPin(message.guild.id, ID, mode, count, action)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_PINRIGGER"].replace("{{ID}}", ID)) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 3

function randomizeID() {
    let id = "";
    for (var i = 0; i < 6; i++) id = id + b64[Math.floor(Math.random() * Math.floor(b64.length))]

    return id;
}