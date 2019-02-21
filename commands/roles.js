module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let roles = await db.getRoles(message.guild.id);

    if (Object.keys(roles).length == 0) return message.channel.send("❌ This server does not have any roles set up." + (permissionLevel >= 2 ? " Get help on how to make one, type \`" + config.prefix + "help addrole\`" : ""))
    return message.channel.send("📋 Roles for **" + message.guild.name + "**:\n" + formatRoles(roles, message.guild))
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

module.exports.description = {
    "description": "",
    "usage": {},
    "examples": {}
}

function formatRoles(roles, guild) {
    let rolesList = [];
    for (var ID in roles) if (guild.roles.get(roles[ID].role)) rolesList.push("- \`" + ID + "\` " + (roles[ID].mode == "each" ? "Every " + formatSuffix(roles[ID].count) + "count" : "Count number " + roles[ID].count) + " will give the role '" + guild.roles.get(roles[ID].role).name + "'" + (roles[ID].duration == "permanent" ? " (permanent)" : ""))
    return rolesList.join("\n");
}

function formatSuffix(count) {
    let str = count.toString();
    if (str == "1") return "";
    if (str.endsWith("1")) return str + "st ";
    if (str.endsWith("2")) return str + "nd ";
    if (str.endsWith("3")) return str + "rd ";
    return str + "th ";
}