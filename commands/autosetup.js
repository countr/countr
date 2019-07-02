module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let botMsg = await message.channel.send("♨ " + strings["AUTOSETUP_WORKING"]);

    try {
        let ch = await message.guild.createChannel("counting", {
            type: "text",
            parent: message.channel.parent,
            rateLimitPerUser: 2
        })

        botMsg.edit("✅ " + strings["AUTOSETUP_SUCCESS"].replace("{{CHANNEL}}", ch.toString()))
    } catch(e) {
        botMsg.edit("❌ " + strings["AUTOSETUP_ERROR"])
    }
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0