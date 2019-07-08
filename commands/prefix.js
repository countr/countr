module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let prefix = args.join(" ").replace("{{SPACE}}", " ");

    let botMsg = await message.channel.send("♨ " + strings["SAVING_PREFIX"]);

    db.setPrefix(message.guild.id, prefix)
        .then(() => { botMsg.edit("✅ " + strings["SAVED_PREFIX"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 1