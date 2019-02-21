let fs = require("fs")

module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    if (args.length == 0) return message.channel.send("📋 You can find documentation for the bot here: https://this-is.coming.soon/in-3.0");

    let command = args[0].toLowerCase()
    if (commands[command]) return message.channel.send("🔅 **\`" + config.prefix + command + (Object.keys(commands[command].usage).join(" ") ? " " + Object.keys(commands[command].usage).join(" ") : "") + "\`: " + commands[command].description + "**" + (formatUsage(commands[command].usage, config.prefix) ? "\n\n**Arguments:**\n" + formatUsage(commands[command].usage, config.prefix) : "") + (formatExamples(commands[command].examples, command, config.prefix) ? "\n\n**Examples:**\n" + formatExamples(commands[command].examples, command, config.prefix) : ""))
    
    return message.channel.send("⚠ Command does not exist. For help, try \`" + config.prefix + "help help\`");
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

module.exports.description = {
    "description": "Get the documentation or get help on a command.",
    "usage": {
        "[command]": "Get help on a command."
    },
    "examples": {
        "-": "Get link to the documentation.",
        "help": "Get help for the command help. (what a stupid example when you're already here)",
    }
}

let cmdFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js")).map(file => file.split(".")[0])
let commands = {};

cmdFiles.forEach(command => {
    let description = require("./" + command + ".js").description;
    if (description) commands[command] = description;
})

function format(str, prefix) {
    while (str.includes("{{PREFIX}}")) str = str.replace("{{PREFIX}}", prefix)
    return str;
}

function formatUsage(args, prefix) {
    let list = [];
    for (var arg in args) list.push("- \`" + arg + "\`: " + format(args[arg], prefix));
    return list.join("\n");
}

function formatExamples(examples, command, prefix) {
    let list = [];
    for (var ex in examples) list.push("- \`" + prefix + command + (ex !== "-" ? " " + ex : "") + "\`: " + format(examples[ex], prefix));
    return list.join("\n");
}