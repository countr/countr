module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let channel = message.channel;

    if (args[0]) {
        channel = message.guild.channels.find(c => c.name == args[0]);
        if (!channel) channel = message.guild.channels.get(args[0]);
        if (!channel) channel = message.guild.channels.get(args[0].replace("<#", "").replace(">", ""));
        if (!channel) return message.channel.send("❌ Channel not found. For help, try \`" + config.prefix + "help link\`");
    }
    
    let botMsg = await message.channel.send("♨ Saving channel to database.");

    db.setChannel(message.guild.id, channel.id)
        .then(() => { botMsg.edit("✅ Saved channel <#" + channel.id + "> to database.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0

module.exports.description = {
    "description": "Link a counting channel.",
    "usage": {
        "[channel]": "Specify what channel you want to become the counting channel. This can either be the name, mention or ID of the channel. If it's empty, it will be the channel the command was sent in."
    },
    "examples": {
        "#counting": "Link the channel called #counting."
    }
}