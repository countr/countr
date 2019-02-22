module.exports.run = async (client, message, args, db, permissionLevel, config) => {
    let topic = args.join(" ");

    let botMsg = await message.channel.send("♨ Saving topic to database.");

    db.setTopic(message.guild.id, topic)
        .then(() => { botMsg.edit("✅ Topic has been saved.") })
        .catch(err => { console.log(err); botMsg.edit("❌ An unknown error occoured. Please contact support.") });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1

module.exports.description = {
    "description": "Set the topic.",
    "usage": {
        "<topic...>": "Set the topic to whatever you want. Use \`{{COUNT}}\` as a placeholder for the count. If you put \"reset\", it will reset back to default. If you put \"disable\", the topic will never change."
    },
    "examples": {
        "Count to infinity! Next count is {{COUNT}}.": "An example of using a placeholder."
    }
}