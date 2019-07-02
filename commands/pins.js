module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let pins = await db.getPins(message.guild.id);

    if (Object.keys(pins).length == 0) return message.channel.send("❌ " + strings["NO_PINTRIGGERS"] + (permissionLevel >= 2 ? " " + strings["GET_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addpin\`") : ""))
    return message.channel.send("📋 " + strings["PINTRIGGERS"].replace("{{SERVER}}", "**" + message.guild.name + "**") + ":\n" + formatPins(pins, message.guild, strings))
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

function formatPins(pins, guild, strings) {
    let pinsList = [];
    for (var ID in pins) { console.log(pins[ID])
        let mode = "";
        if (pins[ID].mode == "each") mode = strings["EVERY_X_COUNT_PINS"].replace("{{COUNT}}", formatSuffix(pins[ID].count, strings))
        if (pins[ID].mode == "only") mode = strings["COUNT_X_PINS"].replace("{{COUNT}}", pins[ID].count)

        pinsList.push("- \`" + ID + "\` " + mode);
    }
    
    return pinsList.join("\n");
}

function formatSuffix(count, strings) {
    let str = count.toString();
    if (str == "1") return "";
    if (str.endsWith("1")) return strings["NUM_ST"].replace("{{NUM}}", str);
    if (str.endsWith("2")) return strings["NUM_ND"].replace("{{NUM}}", str);
    if (str.endsWith("3")) return strings["NUM_RD"].replace("{{NUM}}", str);
    return strings["NUM_TH"].replace("{{NUM}}", str);
}