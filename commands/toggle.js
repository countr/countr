module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    if (!args[0]) return message.channel.send("📋 " + strings["LIST_MODULES"] + ":\n" + formatModules(strings.modules))

    let argModule = args[0].toLowerCase();
    if (!Object.keys(strings["MODULES"]).includes(argModule)) return message.channel.send("❌ " + strings["MODULE_DOESNT_EXIST"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help toggle\`"));

    let gModules = await db.getModules(message.guild.id);
    let enabled = gModules.includes(argModule);

    let botMsg = await message.channel.send("♨ " + strings["ENABLING_DISABLING_MODULE_Y"].replace("{{STATE}}", (enabled ? strings["DISABLING"] : strings["ENABLING"])).replace("{{MODULE}}", argModule));

    db.toggleModule(message.guild.id, argModule)
        .then(() => { botMsg.edit("✅ " + strings["MODULE_X_HAS_BEEN_ENABLED_DISABLED"].replace("{{MODULE}}", "\`" + argModule + "\`").replace("{{STATE}}", (enabled ? strings["DISABLED_LC"] : strings["ENABLED_LC"]))) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0

function formatModules(modules) {
    let modulesList = []
    for (var i in modules) modulesList.push("- \`" + i + "\`: " + modules[i])
    return modulesList.join("\n")
}