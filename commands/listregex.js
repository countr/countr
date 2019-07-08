module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let list = await db.listRegex(message.guild.id);

    if (Object.keys(list).length == 0) return message.channel.send("❌ " + strings["NO_REGEX"])
    return message.channel.send("📋 " + strings["REGEX_LIST"] + ":\n" + list.map(l => "\`" + l + "\`").join("\n"))
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0