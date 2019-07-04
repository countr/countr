module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let botMsg = await message.channel.send("♨ " + strings["REMOVING_CHANNEL"]);

    db.setChannel(message.guild.id, "0")
        .then(() => { botMsg.edit("✅ " + strings["REMOVED_CHANNEL"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0