module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let roles = await db.getRoles(message.guild.id);

    if (Object.keys(roles).length == 0) return message.channel.send("❌ " + strings["NO_ROLEREWARDS"] + (permissionLevel >= 2 ? " " + strings["NO_ROLEREWARDS_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addrole\`") : ""))
    return message.channel.send("📋 " + strings["ROLEREWARDS"].replace("{{SERVER}}", "**" + message.guild.name + "**") + ":\n" + formatRoles(roles, message.guild, strings))
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

function formatRoles(roles, guild, strings) {
    let rolesList = [];
    for (var ID in roles) {
        let mode = "";
        if (roles[ID].mode == "each") mode = strings["EVERY_X_COUNT_GIVES_Y"].replace("{{COUNT}}", formatSuffix(roles[ID].count, strings))
        if (roles[ID].mode == "only") mode = strings["COUNT_X_GIVES_Y"].replace("{{COUNT}}", roles[ID].count)
        if (roles[ID].mode == "score") mode = strings["ON_USER_X_GIVES_Y"].replace("{{COUNT}}", roles[ID].count)

        if (guild.roles.get(roles[ID].role)) rolesList.push("- \`" + ID + "\` " + mode.replace("{{ROLE}}", guild.roles.get(roles[ID].role).name).replace("{{PERMANENT}}", roles[ID].duration == "permanent" ? strings["PERMANENT"] : ""))
    }
    
    return rolesList.join("\n");
}

function formatSuffix(count, strings) {
    let str = count.toString();
    if (str == "1") return "";
    if (str.endsWith("1")) return strings["NUM_ST"].replace("{{NUM}}", str);
    if (str.endsWith("2")) return strings["NUM_ND"].replace("{{NUM}}", str);
    if (str.endsWith("3")) return strings["NUM_RD"].replace("{{NUM}}", str);
    return strings["NUM_TH"].replace("{{NUM}}", str);
}