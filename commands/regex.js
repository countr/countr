module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    if (args.length == 0) return message.channel.send("📋 Current regex: \`" + await db.getRegex(message.guild.id) + "\`")

    let regex = args.join(" ");
    if (regex.toLowerCase() == "disable") regex = "";
    else {
        let isValid = true;
        try { new RegExp(regex, 'g') } catch(e) { isValid = false; }
        if (!isValid) return message.channel.send("❌ " + strings["INVALID_REGEX"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help regex\`"))
    }

    let botMsg = await message.channel.send("♨ " + strings["SAVING_REGEX"]);

    db.setRegex(message.guild.id, topic)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_REGEX"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0