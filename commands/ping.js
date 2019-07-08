module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let botMsg = await message.channel.send("〽 " + strings["PINGING"]);
    botMsg.edit("🏓 " + strings["PINGED"].replace("{{LATENCY.SERVER}}", "\`" + (botMsg.createdTimestamp - message.createdTimestamp) + "ms\`").replace("{{LATENCY.API}}", "\`"+ Math.round(client.ping) + "ms\`"));
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0