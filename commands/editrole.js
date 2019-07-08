module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let ID = args[0];
    if (!await db.roleExists(message.guild.id, ID)) return message.channel.send("❌ " + strings["ROLEREWARD_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editrole\`"));

    let property = args[1].toLowerCase();
    if (!["role", "mode", "count", "duration"].includes(property)) return message.channel.send("❌ " + strings["INVALID_PROPERTY"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editrole\`"));

    let value;
    if (property == "role") {
        value = message.guild.roles.find(r => r.name == args[2]);
        if (!value) value = message.guild.roles.get(args[2]);
        if (!value) value = message.guild.roles.get(args[2].replace("<@&", "").replace(">", ""));
        if (!value) return message.channel.send("❌ " + strings["ROLE_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editrole\`"));
    } else if (property == "mode") {
        value = args[2].toLowerCase();
        if (!["each", "only"].includes(value)) return message.channel.send("❌ " + strings["INVALID_MODE"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editrole\`"));
    } else if (property == "count") {
        value = parseInt(args[2]);
        if (!value) return message.channel.send("❌ " + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editrole\`"));
    } else if (property == "duration") {
        value = args[2].toLowerCase();
        if (!["temporary", "permanent"].includes(value)) return message.channel.send("❌ " + strings["INVALID_DURATION"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editrole\`"));
    }
    
    let botMsg = await message.channel.send("♨ " + strings["SAVING_ROLEREWARD_EDITS"]);

    db.editRole(message.guild.id, ID, property, value)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_ROLEREWARD_EDITS"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 3