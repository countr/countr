module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    if (args.length == 0) {
        let regex = await db.getRegex(message.guild.id);
        if (!regex) return message.channel.send("❌ " + strings["NO_REGEX"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help regex\`"))
        return message.channel.send("📋 " + strings["CURRENT_REGEX"] + " \`" + regex + "\`")
    }

    let regex = args.join(" ");
    if (regex.toLowerCase() == "disable") regex = "";
    else {
        let isValid = true;
        try { new RegExp(regex, 'g') } catch(e) { isValid = false; }
        if (!isValid) return message.channel.send("❌ " + strings["INVALID_REGEX"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help regex\`"))
    }

    let botMsg = await message.channel.send("♨ " + strings["SAVING_REGEX"]);

    db.setRegex(message.guild.id, regex)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_REGEX"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0