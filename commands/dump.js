module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    await message.author.send("Database information from " + message.guild.name + " (" + message.guild.id + ") ```json\n" + JSON.stringify(await db.getGuild(message.guild.id), null, 2) + "```");
    message.channel.send("✅ Sent to DMs.");
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 3
module.exports.argsRequired = 0