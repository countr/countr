const b64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"; // base64

module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let count = parseInt(args[0]);
    if (!count) count = parseInt(args[1]);
    if (!count) return message.channel.send("❌ Invalid count. For help, try \`" + config.prefix + "help notifyme\`");

    let ID = randomizeID();
    while (await db.notificationExists(message.guild.id, ID)) ID = randomizeID();
    
    let botMsg = await message.channel.send("♨ Saving notification to database. Please wait.");

    db.setNotification(message.guild.id, ID, message.author.id, (args[0].toLowerCase() == "each" ? "each" : "only"), count)
        .then(() => { botMsg.edit("✅ Saved notification to database. ID \`" + ID + "\`") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 1

module.exports.description = {
    "description": "Get a notification whenever the server reach whatever count you want.",
    "usage": {
        "[each]": "If you use \`each\` here, it will be each count in the \"counting chain\", example; 2, 4, 6, 8, 10 etc.",
        "<count>": "This is the count you want to get notified of."
    },
    "examples": {
        "each 1000": "Whenever the server reach 1000, 2000, 3000 etc. you will be notified in DMs.",
        "420": "Whenever the server reach the count 420, you will be notified in DMs."
    }
}

function randomizeID() {
    let id = "";
    for (i = 0; i < 4; i++) id = id + b64[Math.floor(Math.random() * Math.floor(b64.length))]

    return id;
}