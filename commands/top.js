let emojis = ['🌀', '💠', '🔷', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', '🔟', '💩']

module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    let users = await db.getUsers(message.guild.id);
    let sorted = Object.keys(users).sort((a, b) => users[b] - users[a]).filter(u => message.guild.members.get(u))
    let topten = sorted.slice(0, 10);

    let leaderboard = []
    for (var i in topten) {
        let id = topten[i];
        leaderboard.push(emojis[i] + " \`" + users[id] + "\` <@" + id + ">")
    }

    message.channel.send({ embed: {
        author: {
            name: message.guild.name + " " + strings["LEADERBOARD"],
            icon_url: message.guild.iconURL
        },
        description: leaderboard.join("\n") + (topten.includes(message.author.id) ? "" : "\n\n" + emojis[10] + " " + (sorted.includes(message.author.id) ? strings["LEADERBOARD_POSITION"].replace("{{POSITION}}", sorted.indexOf(message.author.id) + 1).replace("{{COUNT}}", users[message.author.id]) : strings["USER_NOT_ON_LEADERBOARD"])),
        color: config.color
    }})
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0