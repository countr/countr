module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    if (!args[0]) return message.channel.send("📋 List of modules:\n" + formatModules(modules))

    let argModule = args[0].toLowerCase();
    if (!Object.keys(modules).includes(argModule)) return message.channel.send("❌ Module does not exist. For help, try \`" + config.prefix + "help toggle\`");

    let gModules = await db.getModules(message.guild.id);
    let enabled = gModules.includes(argModule);

    let botMsg = await message.channel.send("♨ " + (enabled ? "Disabling" : "Enabling") + " module \`" + argModule + "\`");

    db.toggleModule(message.guild.id, argModule)
        .then(() => { botMsg.edit("✅ Module \`" + argModule + "\` has been " + (enabled ? "disabled" : "enabled") + ".") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0

module.exports.description = {
    "description": "Toggle a module or get a list of modules.",
    "usage": {
        "[module]": "Specify what module you want to toggle. Leave emoty for a list of them."
    },
    "examples": {}
}

function formatModules(modules) {
    let modulesList = []
    for (var i in modules) modulesList.push("- \`" + i + "\`: " + modules[i])
    return modulesList.join("\n")
}

const modules = {
    "allow-spam": "Allow people to talk multiple times in a row, essentially spamming the channel.",
    "talking": "Allow people to send a message after the number.",
    "recover": "If the bot goes offline, make it remove all unprocessed messages in the counting channel when it's back up.",
    "reposting": "Repost the message being sent in an embed, preventing the users from editing or self-deleting their message.",
    "webhook": "Make all messages get reposted using a webhook, preventing users from editing or self-deleting their message."
}