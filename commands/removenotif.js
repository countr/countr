module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let ID = args[0];
    let notifications = await db.getNotifications(message.guild.id, message.author.id);
    if (!Object.keys(notifications).includes(ID)) return message.channel.send("❌ Notification ID not found. For help, try \`" + config.prefix + "help removenotif\`");
    
    let botMsg = await message.channel.send("♨ Removing notification to database. Please wait.");

    db.setNotification(message.guild.id, ID, false)
        .then(() => { botMsg.edit("✅ Removed notification from database.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 1

module.exports.description = {
    "description": "Remove a notification.",
    "usage": {
        "<ID>": "This is the notification ID. All your notification IDs can be found in \`{{PREFIX}}notifications\`."
    },
    "examples": {
        "v43T": "Remove notification with ID \`v43T\`."
    }
}