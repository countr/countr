module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let botMsg = await message.channel.send("♨ " + strings["RESETTING_COUNT"]);

    db.setCount(message.guild.id, 0)
        .then(() => { botMsg.edit("✅ " + strings["RESET_COUNT"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 1
module.exports.argsRequired = 0