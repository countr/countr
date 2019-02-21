module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let count = parseInt(args[0]);
    if (!count) return message.channel.send("❌ Invalid count. For help, try \`" + config.prefix + "help set\`");

    let botMsg = await message.channel.send("♨ Saving count to database.");

    db.setCount(message.guild.id, count)
        .then(() => { botMsg.edit("✅ Count has been saved.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 1
module.exports.argsRequired = 1

module.exports.description = {
    "description": "Set the count.",
    "usage": {
        "<count>": "Specify the count you want."
    },
    "examples": {}
}