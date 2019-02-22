module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let ID = args[0];
    if (!await db.roleExists(message.guild.id, ID)) return message.channel.send("❌ Role reward ID does not exist in our databases. For help, try \`" + config.prefix + "help editRole\`");

    let property = args[1].toLowerCase();
    if (!["role", "mode", "count", "duration"].includes(property)) return message.channel.send("❌ Invalid property. For help, try \`" + config.prefix + "help editRole\`")

    let value;
    if (property == "role") {
        value = message.guild.roles.find(r => r.name == args[2]);
        if (!value) value = message.guild.roles.get(args[2]);
        if (!value) value = message.guild.roles.get(args[2].replace("<@&", "").replace(">", ""));
        if (!value) return message.channel.send("❌ Role not found. For help, try \`" + config.prefix + "help editRole\`");
    } else if (property == "mode") {
        value = args[2].toLowerCase();
        if (!["each", "only"].includes(value)) return message.channel.send("❌ Invalid mode. For help, try \`" + config.prefix + "help editRole\`");
    } else if (property == "count") {
        value = parseInt(args[2]);
        if (!value) return message.channel.send(":x: Invalid count. For help, try \`" + config.prefix + "help editRole\`");
    } else if (property == "duration") {
        value = args[2].toLowerCase();
        if (!["temporary", "permanent"].includes(value)) return message.channel.send(":x: Invalid duration. For help, try \`" + config.prefix + "help editRole\`");
    }
    
    let botMsg = await message.channel.send("♨ Saving role edits.");

    db.editRole(message.guild.id, ID, property, value)
        .then(() => { botMsg.edit("✅ Role edits saved.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 3

module.exports.description = {
    "description": "Edit a role reward.",
    "usage": {
        "<ID>": "This is the ID of the role reward. This can be found if you type \`{{PREFIX}}roles\`.",
        "<property>": "This will be what you want to edit. Valid properties: \`role\`, \`mode\`, \`count\`, \`duration\`.",
        "<value>": "Read \`{{PREFIX}}help addRole\` to see the different values for each property."
    },
    "examples": {
        "MnRIf4 mode each": "This will change the Role Reward ID \`MnRIf4\`'s mode to \`each\`.",
        "jPFj78 count 1337": "This will change the Role Reward ID \`jPFj78\`'s count to 1337."
    }
}