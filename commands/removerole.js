module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let ID = args[0];
    if (!await db.roleExists(message.guild.id, ID)) return message.channel.send("❌ " + strings["ROLEREWARD_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help removerole\`"));
    
    let botMsg = await message.channel.send("♨ " + strings["REMOVING_ROLEREWARD"]);

    db.setRole(message.guild.id, ID, false)
    .then(() => { botMsg.edit("✅ " + strings["REMOVED_ROLEREWARD"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1