module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let botMsg = await message.channel.send("〽 Pinging...");
    botMsg.edit("🏓 Server latency is \`" + (botMsg.createdTimestamp - message.createdTimestamp) + "ms\` and API Latency is \`"+ Math.round(client.ping) + "ms\`.")
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

module.exports.description = {
    "description": "Check server latency and API latency.",
    "usage": {},
    "examples": {}
}