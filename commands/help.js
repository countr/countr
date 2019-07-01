module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    if (args.length == 0) return message.channel.send("📋 " + strings["DOCUMENTATION"] + ": https://countr.js.org/\n📎 " + strings["SUPPORT_SERVER"] + ": https://countr.page.link/support");

    let command = args[0].toLowerCase()
    let commandDesc = strings["COMMAND_" + command.toUpperCase()]

    if (commandDesc) return message.channel.send("🔅 **\`" + config.prefix + command + (Object.keys(commandDesc.usage).join(" ") ? " " + Object.keys(commandDesc.usage).join(" ") : "") + "\`: " + commandDesc.description + "**" + (formatUsage(commandDesc.usage, config.prefix) ? "\n\n**" + strings["ARGUMENTS"] + ":**\n" + formatUsage(commandDesc.usage, config.prefix) : "") + (formatExamples(commandDesc.examples, command, config.prefix) ? "\n\n**" + strings["EXAMPLES"] + ":**\n" + formatExamples(commandDesc.examples, command, config.prefix) : ""))
    
    return message.channel.send("⚠ " + strings["COMMAND_DOES_NOT_EXIST"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + config.prefix + "help help\`"));
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0