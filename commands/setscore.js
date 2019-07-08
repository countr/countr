module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let member = message.guild.members.get(args[0]);
    if (!member) member = message.guild.members.get(args[0].replace("<@", "").replace("!", "").replace(">", ""));
    if (!member) return message.channel.send("❌ " + strings["USER_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help setscore\`"));
    
    let count = parseInt(args[1]);
    if (!count && count !== 0) return message.channel.send("❌" + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help setscore\`"));

    let botMsg = await message.channel.send("♨ " + strings["SAVING_SCORE"]);

    db.setScore(message.guild.id, member.user.id, count)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_SCORE"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 1
module.exports.argsRequired = 2