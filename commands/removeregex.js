module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let regex = args.join(" ");
    if (!await db.regexExists(message.guild.id, regex)) return message.channel.send("❌ " + strings["REGEX_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help removeregex\`"));

    let botMsg = await message.channel.send("♨ " + strings["REMOVING_REGEX"]);

    db.removeRegex(message.guild.id, regex)
        .then(() => { botMsg.edit("✅ " + strings["REMOVED_REGEX"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1