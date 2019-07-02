module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let count = parseInt(args[0]);
    if (!count) return message.channel.send("❌" + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help set\`"));

    let botMsg = await message.channel.send("♨ " + strings["SAVING_COUNT"]);

    db.setCount(message.guild.id, count)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_COUNT"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 1
module.exports.argsRequired = 1