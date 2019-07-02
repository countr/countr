module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let ID = args[0];
    if (!await db.pinExists(message.guild.id, ID)) return message.channel.send("❌ " + strings["PINTRIGGER_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help removepin\`"));
    
    let botMsg = await message.channel.send("♨ " + strings["REMOVING_PINTRIGGER"]);

    db.setPin(message.guild.id, ID, false)
    .then(() => { botMsg.edit("✅ " + strings["REMOVED_PINTRIGGER"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1