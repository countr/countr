module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let code = args.join(" ");
    try {
        let evaled = eval(code);
        if (typeof evaled != "string") evaled = require("util").inspect(evaled);

        message.channel.send("🆗 Evaluated successfully.\n\`\`\`js\n" + evaled + "\`\`\`");
    } catch (e) {
        message.channel.send("🆘 Failed to evaluate JavaScript-code.\n\`\`\`fix\n" + clean(e) + "\`\`\`");
    }
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 4
module.exports.argsRequired = 0

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}