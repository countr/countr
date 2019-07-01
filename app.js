const Discord = require("discord.js");
const BLAPI = require("blapi");

const config = require("./config.json")

const client = new Discord.Client({ disableEveryone: true, messageCacheMaxSize: 60, messageSweepInterval: 10 })
const db = require("./database.js")(client, config)

let disabledGuilds = [];

client.on("message", async (message) => {
    if (!message.guild || message.author.id == client.user.id) return;

    let strings = require("./language/en.json");
    try {
        let lang = require("./language/" + await db.getLanguage(message.guild.id) + ".json");
        for (var i in lang) strings[i] = lang[i]; // if some strings doesn't exist, we still have the english translation for it
    } catch(e) {}

    let countingChannel = await db.getChannel(message.guild.id), prefix = await db.getPrefix(message.guild.id);
    if (countingChannel == message.channel.id) {
        if (disabledGuilds.includes(message.guild.id)) return message.delete();
        if (message.author.bot && message.webhookID == null) return message.delete()

        if (message.webhookID) return;
        if (message.content.startsWith("!") && getPermissionLevel(message.member) >= 1) return;
        if (message.type != "DEFAULT") return;
        
        let _ = await db.getCount(message.guild.id), count = _.count, user = _.user;

        let modules = await db.getModules(message.guild.id);

        if (!modules.includes("allow-spam") && message.author.id == user) return message.delete();
        if (message.content.split(" ")[0] != (count + 1).toString()) return message.delete()
        if (!modules.includes("talking") && message.content != (count + 1).toString()) return message.delete()
        db.addToCount(message.guild.id, message.author.id); count += 1;

        let countMsg = message;
        if (modules.includes("webhook")) await message.channel.fetchWebhooks().then(async webhooks => {
            let webhook = webhooks.find(wh => wh.name == "Countr");
            if (!webhook) webhook = await message.channel.createWebhook("Countr");

            countMsg = await webhook.send(message.content, {
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL.split("?")[0]
            })
            message.delete()
        }); else if (modules.includes("reposting")) await message.channel.send({
            embed: {
                description: "<@!" + message.author.id + ">: " + message.content,
                color: message.member.displayColor ? message.member.displayColor : 3553598
            }
        }).then(msg => {
            countMsg = msg;
            message.delete()
        })

        db.setLastMessage(message.guild.id, countMsg.id);
        db.checkNotifications(message.guild.id, count, message.author.id, countMsg.id, strings);
        db.checkRole(message.guild.id, count, message.author.id, strings);

    } else if (message.author.bot) return; else if(message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) {
        let args = message.content.split(" ");
        if (args[0].match(`^<@!?${client.user.id}>`)) args.shift(); else args[0] = args[0].slice(prefix.length);
        let command = args.shift().toLowerCase()

        try {
            if (getPermissionLevel(message.member) < require("./commands/" + command + ".js").permissionRequired) return message.channel.send((require("./commands/" + command + ".js").permissionRequired > 2 ? "📛" : "⛔") + " " + strings["NO_PERMISSION"])
            if (args.length < require("./commands/" + command + ".js").argsRequired) return message.channel.send("❌ " + strings["NOT_ENOUGH_ARGS"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + config.prefix + "help " + command + "\`"));
            require("./commands/" + command + ".js").run(client, message, args, db, getPermissionLevel(message.member), strings, config);
        } catch(e) {/* Command does not exist */} 
    } else if (message.content.match(`^<@!?${client.user.id}>`)) return message.channel.send("👋 " + strings["HELLO"].replace("{{PREFIX}}", "\`" + prefix + "\`").replace("{{HELP}}", "\`" + prefix + "help\`."));
})

client.on("ready", async () => {
    console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Ready!")
    client.guilds.forEach(processGuild)

    let guild = config.mainGuild ? client.guilds.get(config.mainGuild) : null;

    updatePresence(guild)
    setInterval(() => updatePresence(guild), 60000)

    // Below is custom code. This tells bot sites what the server count currently is for Countr. Usually, this is disabled unless you are a really smart developer and actually figure out how to properly activate it without breaking it. This is not recommended, as most bot sites require original code -- but if you still want a couple of bans, go ahead.
    if (config.listKeys) {
        BLAPI.handle(client, config.listKeys, 15);
    }
})

async function updatePresence(guild) {
    let name = config.prefix + "help (" + await db.getCounts() + " counts this week)";
    if (guild) {
      let _ = await db.getCount(guild.id), count = _.count;
      name = "#" + guild.channels.get(await db.getChannel(guild.id)).name + " (" + count + " counts so far)";
    }
    client.user.setPresence({ status: "online", game: { name, type: "WATCHING" } })
}

async function processGuild(guild) {
    disabledGuilds.push(guild.id);

    let strings = require("./language/en.json");
    try {
        let lang = require("./language/" + await db.getLanguage(message.guild.id) + ".json");
        for (var i in lang) strings[i] = lang[i]; // if some strings doesn't exist, we still have the english translation for it
    } catch(e) {}

    let modules = await db.getModules(guild.id);
    
    if (modules.includes("recover")) {
        let countingChannel = await db.getChannel(guild.id);
        let channel = guild.channels.get(countingChannel)

        if (channel) {
            let c = await db.getCount(guild.id);
            let messages = await channel.fetchMessages({ limit: 100, after: c.message })
            if (messages.array().length > 0) {
                let botMsg = await channel.send("💢 " + strings["MAKING_READY"] + " \`" + strings["LOCKING"] + "\`")
                await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: false })
                    .then(() => { botMsg.edit("💢 " + strings["MAKING_READY"] + " \`" + strings["S_DELETING"] + "\`") })
                    .catch(() => { botMsg.edit("💢 " + strings["MAKING_READY"] + " \`" + strings["F_DELETING"] + "\`") })
                
                let processing = true;
                let fail = false;
                while (processing) {
                    let messages = await channel.fetchMessages({ limit: 100, after: c.message });
                    messages = messages.filter(m => m.id != botMsg.id);
                    if (messages.array().length == 0) processing = false;
                    else await channel.bulkDelete(messages)
                        .catch(() => { fail = true; });
                }

                await botMsg.edit("💢 " + strings["MAKING_READY"] + " \`" + (fail ? strings["F_RESTORING"] : strings["S_RESTORING"]) + "\`");
                await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: true })
                    .then(() => { botMsg.edit("💢 " + strings["MAKING_READY"] + " \`" + strings["S_UNLOCKED"] + "\`") })
                    .catch(() => { botMsg.edit("💢 " + strings["MAKING_READY"] + " \`" + strings["F_UNLOCKED"] + "\`") })
                
                botMsg.delete(15000);
            }
        }
    }

    return disabledGuilds = disabledGuilds.filter(g => g != guild.id)
}

let getPermissionLevel = (member) => {
    if (config.admins[0] == member.user.id) return 4;
    if (config.admins.includes(member.user.id)) return 3;
    if (member.hasPermission("MANAGE_GUILD")) return 2;
    if (member.hasPermission("MANAGE_MESSAGES")) return 1;
    return 0;
}

client.on("disconnect", dc => { console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Disconnected. " + dc) });
client.on("error", err => { console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Unexpected error:"); console.log(err) });
client.on("rateLimit", rl => { console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Rate limited. [" + rl.timeDifference + "ms]") });
client.on("reconnecting", () => { console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Reconnecting...") });
client.on("resume", replayed => { console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Resumed. [" + replayed + " events replayed]") });
client.on("warn", info => { console.log((client.shard ? "Shard " + client.shard.id + ": " : "") + "Unexpected warning:"); console.log(info) })

client.login(config.token)