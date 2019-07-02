module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let ID = args[0];
    if (!await db.pinExists(message.guild.id, ID)) return message.channel.send("❌ " + strings["PINTRIGGER_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editpin\`"));

    let property = args[1].toLowerCase();
    if (!["mode", "count", "action"].includes(property)) return message.channel.send("❌ " + strings["INVALID_PROPERTY"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editpin\`"));

    let value;
    if (property == "mode") {
        value = args[2].toLowerCase();
        if (!["each", "only"].includes(value)) return message.channel.send("❌ " + strings["INVALID_MODE"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editpin\`"));
    } else if (property == "count") {
        value = parseInt(args[2]);
        if (!value) return message.channel.send("❌ " + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editpin\`"));
    } else if (property == "action") {
        value = args[2].toLowerCase();
        if (!["keep", "repost"].includes(value)) return message.channel.send("❌ " + strings["INVALID_ACTION"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help editpin\`"));
    }
    
    let botMsg = await message.channel.send("♨ " + strings["SAVING_PINTRIGGER_EDITS"]);

    db.editpin(message.guild.id, ID, property, value)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_PINTRIGGER_EDITS"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 3