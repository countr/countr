module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let topic = args.join(" ");
    if (topic.toLowerCase() == "reset") topic = "";

    let botMsg = await message.channel.send("♨ " + strings["SAVING_TOPIC"]);

    db.setTopic(message.guild.id, topic)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_TOPIC"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1