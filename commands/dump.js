module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let id = args[0];
    if (!id) id = message.guild.id;

    await message.author.send("Database information for guild " + id + "```json\n" + JSON.stringify(await db.getGuild(id), null, 2) + "```");
    message.channel.send("✅ Sent to DMs.");
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 3
module.exports.argsRequired = 0