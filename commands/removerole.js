module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let ID = args[0];
    if (!await db.roleExists(message.guild.id, ID)) return message.channel.send("❌ Role Reward ID not found. For help, try \`" + config.prefix + "help removerole\`");
    
    let botMsg = await message.channel.send("♨ Removing role reward to database. Please wait.");

    db.setRole(message.guild.id, ID, false)
        .then(() => { botMsg.edit("✅ Removed role reward from database.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1

module.exports.description = {
    "description": "Remove a Role Reward.",
    "usage": {
        "<ID>": "This is the ID of the role reward. This can be found if you type \`{{PREFIX}}roles\`."
    },
    "examples": {
        "4s2h2Q": "Remove the Role Reward with ID \`4s2h2Q\`"
    }
}