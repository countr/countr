const fs = require("fs");

let authors = {}, botClient;

module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    botClient = client;
    if (args.length == 0) {
        let all = fs.readdirSync("./language"), list = [];
        for (var i in all) {
            let file = all[i], json = JSON.parse(fs.readFileSync("./language/" + file, "utf8")), authors = await getAuthors(file.split(".")[0], client);
            list.push("\`" + file.split(".")[0] + "\` " + json["LANGUAGE"] + (authors.length ? "; " + authors.join(", ") : ""));
        }
        return message.channel.send("📋 " + strings["LANGUAGES"] + list.map(l => "\n" + l).join(""));
    }
    
    let botMsg = await message.channel.send("♨ " + strings["SAVING_LANGUAGE"]);

    db.setLanguage(message.guild.id, args[0])
        .then(() => { botMsg.edit("✅ " + strings["SAVED_LANGUAGE"]) })
        .catch(err => { console.log(err); botMsg.edit("❌ " + strings["UNKNOWN_ERROR"]) });
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 2
module.exports.argsRequired = 0

async function getAuthors(language, client) {
    if (!Object.keys(authors).length) await updateAuthors(client);
    return authors[language];
}

async function updateAuthors(client) {
    if (!client) return; // we didn't get the client
    let files = fs.readdirSync("./language").filter(f => f.endsWith(".json"))
    for (var i in files) {
        let language = JSON.parse(fs.readFileSync("./language/" + files[i]));

        let newAuthors = []
        for (var j in language["AUTHORS"]) {
            let a = await client.fetchUser(language["AUTHORS"][j], false).catch(() => null);
            if (a) newAuthors.push([a.username, a.discriminator].join("#"));
        }

        authors[files[i].split(".")[0]] = newAuthors;
    }
    return;
}

setInterval(updateAuthors.bind(botClient), 1800000)