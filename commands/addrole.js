const b64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"; // base64

module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let role = message.guild.roles.find(r => r.name == args[0].replace("_", " "));
    if (!role) role = message.guild.roles.get(args[0]);
    if (!role) role = message.guild.roles.get(args[0].replace("<@&", "").replace(">", ""));
    if (!role) return message.channel.send("❌ Role not found. For help, try \`" + config.prefix + "help addRole\`");

    let mode = args[1].toLowerCase();
    if (!["each", "only"].includes(mode)) return message.channel.send("❌ Invalid mode. For help, try \`" + config.prefix + "help addRole\`");

    let count = parseInt(args[2]);
    if (!count) return message.channel.send("❌ Invalid count. For help, try \`" + config.prefix + "help addRole\`");

    let duration = args[3].toLowerCase();
    if (!["temporary", "permanent"].includes(duration)) return message.channel.send("❌ Invalid duration. For help, try \`" + config.prefix + "help addRole\`");

    let ID = randomizeID();
    while (await db.roleExists(message.guild.id, ID)) ID = randomizeID();
    
    let botMsg = await message.channel.send("♨ Saving role reward to database. Please wait.");

    db.setRole(message.guild.id, ID, role.id, mode, count, duration)
        .then(() => { botMsg.edit("✅ Saved role reward to database. ID \`" + ID + "\`") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 4

module.exports.description = {
    "description": "Add a role that get rewarded users on whatever count you want.",
    "usage": {
        "<role>": "This is the role you want to be rewarded. This can either be the name, mention or ID of the role. If you have spaces in your role name, replace those with underscores.",
        "<mode>": "If you use \`only\`, it will only be that count you specify. If you use \`each\`, it will be each count in the \"counting chain\", example; 2, 4, 6, 8, 10 etc.",
        "<count>": "This is the count you want it to be triggered on.",
        "<duration>": "If you use \`temporary\`, the role will be removed from everyone already having it, and added to the new person. If you use \`permanent\`, you keep the role unless someone removes it."
    },
    "examples": {
        "Count_Champ each 1000 temporary": "This will give the user who counts 1000, 2000, 3000 etc. the role named Count Champ, and the last user who had the role lose it.",
        "469523835595653120 only 420 permanent": "This will give every user who reach count 420 (if you reset it often) the role with the ID 469523835595653120, and will stay on the user forever (until a user removes it)."
    }
}

function randomizeID() {
    let id = "";
    for (i = 0; i < 4; i++) id = id + b64[Math.floor(Math.random() * Math.floor(b64.length))]

    return id;
}