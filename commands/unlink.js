module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let botMsg = await message.channel.send("♨ Removing channel from database.");

    db.setChannel(message.guild.id, "0")
        .then(() => { botMsg.edit("✅ Removed channel from database.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0

module.exports.description = {
    "description": "Unlink the current counting channel.",
    "usage": {},
    "examples": {}
}