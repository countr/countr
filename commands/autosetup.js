module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let botMsg = await message.channel.send("♨ " + strings["AUTOSETUP_WORKING"]);

    try {
        let ch = await message.guild.createChannel("counting", { rateLimitPerUser: 2 });

        db.setChannel(message.guild.id, ch.id);
        db.setCount(message.guild.id, 0);
        db.setLastMessage(message.guild.id, message.id);

        botMsg.edit("✅ " + strings["AUTOSETUP_SUCCESS"].replace("{{CHANNEL}}", ch.toString()))
    } catch(e) {
        botMsg.edit("❌ " + strings["AUTOSETUP_ERROR"])
    }
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0