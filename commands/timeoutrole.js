module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {    
    let role = message.guild.roles.find(r => r.name == args[0].replace("_", " "));
    if (!role) role = message.guild.roles.get(args[0]);
    if (!role) role = message.guild.roles.get(args[0].replace("<@&", "").replace(">", ""));
    if (!role) return message.channel.send("❌ " + strings["ROLE_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help timeoutrole\`"));

    let time = parseInt(args[1]);
    if (!time) return message.channel.send("❌ " + strings["INVALID_TIME"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help timeoutrole\`"));

    let fails = parseInt(args[2]);
    if (!fails) return message.channel.send("❌ " + strings["INVALID_FAILS"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help timeoutrole\`"));

    let duration = parseInt(args[3]);
    if (args[3] && !duration) return message.channel.send("❌ " + strings["INVALID_DURATION"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help timeoutrole\`"));

    let botMsg = await message.channel.send("♨ " + strings["SAVING_TIMEOUT_ROLE"]);

    db.setTimeoutRole(message.guild.id, role.id, time, fails, duration)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_TIMEOUT_ROLE"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 3