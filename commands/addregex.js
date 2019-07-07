module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let regex = args.join(" "), isValid = true;
    try { new RegExp(regex, 'g') } catch(e) { isValid = false; }
    if (!isValid) return message.channel.send("❌ " + strings["INVALID_REGEX"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addregex\`"))

    let botMsg = await message.channel.send("♨ " + strings["SAVING_REGEX"]);

    db.addRegex(message.guild.id, regex)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_REGEX"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1