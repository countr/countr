const b64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"; // base64

module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let role = message.guild.roles.find(r => r.name == args[0].replace("_", " "));
    if (!role) role = message.guild.roles.get(args[0]);
    if (!role) role = message.guild.roles.get(args[0].replace("<@&", "").replace(">", ""));
    if (!role) return message.channel.send("❌ " + strings["ROLE_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addrole\`"));

    let mode = args[1].toLowerCase();
    if (!["each", "only", "score"].includes(mode)) return message.channel.send("❌ " + strings["INVALID_MODE"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addrole\`"));

    let count = parseInt(args[2]);
    if (!count) return message.channel.send("❌ " + strings["INVALID_COUNT"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addrole\`"));

    let duration = args[3].toLowerCase();
    if (!["temporary", "permanent"].includes(duration)) return message.channel.send("❌ " + strings["INVALID_DURATION"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help addrole\`"));

    let ID = randomizeID();
    while (await db.roleExists(message.guild.id, ID)) ID = randomizeID(); // we don't want to override an existing role by accident.
    
    let botMsg = await message.channel.send("♨ " + strings["SAVING_ROLEREWARD"]);

    db.setRole(message.guild.id, ID, role.id, mode, count, duration)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_ROLEREWARD"].replace("{{ID}}", ID)) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 4

function randomizeID() {
    let id = "";
    for (var i = 0; i < 6; i++) id = id + b64[Math.floor(Math.random() * Math.floor(b64.length))]

    return id;
}