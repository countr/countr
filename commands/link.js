module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let channel = message.channel;

    if (args[0]) {
        channel = message.guild.channels.find(c => c.name == args[0]);
        if (!channel) channel = message.guild.channels.get(args[0]);
        if (!channel) channel = message.guild.channels.get(args[0].replace("<#", "").replace(">", ""));
        if (!channel) return  message.channel.send("❌ " + strings["CHANNEL_NOT_FOUND"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + config.prefix + "help link\`"));
    }
    
    let botMsg = await message.channel.send("♨ Saving channel to database.");

    db.setChannel(message.guild.id, channel.id)
        .then(() => { botMsg.edit("✅ Saved channel <#" + channel.id + "> to database.") })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0