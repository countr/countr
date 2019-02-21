const Discord = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'))

const client = new Discord.Client({ disableEveryone: true, messageCacheMaxSize: 60, messageSweepInterval: 10, messageCacheMaxSize: 25 })
const db = require("./database.js")(client, config)

let disabledGuilds = [];

client.on('message', async (message) => {
    if (!message.guild || message.author.id == client.user.id) return;

    let countingChannel = await db.getChannel(message.guild.id);
    if (countingChannel == message.channel.id) {
        if (disabledGuilds.includes(message.guild.id)) return message.delete();
        if (message.author.bot && message.webhookID == null) return message.delete()

        if (message.webhookID != null) return;
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
            let webhook = webhooks.find(wh => wh.name == 'Countr');
            if (!webhook) webhook = await message.channel.createWebhook('Countr');

            countMsg = await webhook.send(message.content, {
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL.split("?")[0]
            })
            message.delete()
        })

        db.setLastMessage(message.guild.id, countMsg.id);
        db.checkNotifications(message.guild.id, count, message.author.id, countMsg.id);
        db.checkRole(message.guild.id, count, message.author.id)

    } else if (message.content.startsWith(config.prefix) || message.content.match(`^<@!?${client.user.id}> `)) {
        let args = message.content.split(" ");
        if (args[0].match(`^<@!?${client.user.id}>`)) args.shift(); else args[0] = args[0].slice(config.prefix.length);
        let command = args.shift().toLowerCase()

        try {
            if (getPermissionLevel(message.member) < require("./commands/" + command + ".js").permissionRequired) return message.channel.send((require("./commands/" + command + ".js").permissionRequired > 2 ? "📛" : "⛔") + " You don't have permission to do this!")
            if (args.length < require("./commands/" + command + ".js").argsRequired) return message.channel.send(":x: Not enough arguments. For help, try \`" + config.prefix + "help " + command + "\`");
            require("./commands/" + command + ".js").run(client, message, args, db, getPermissionLevel(message.member), config);
        } catch(e) {
            console.log(e)
        } 
    } else if (message.content.match(`^<@!?${client.user.id}>`) && fs.existsSync('./custom.js')) return message.channel.send(":wave: My prefix is \`" + config.prefix + "\`, for help type \`" + config.prefix + "help\`.")
})

client.on('ready', async () => {
    console.log((client.shard ? "Shard " + client.shard.id + " " : "") + "Ready!")
    client.guilds.forEach(processGuild)

    let guild = config.mainGuild ? client.guilds.get(config.mainGuild) : null;

    updatePresence(guild)
    setInterval(() => updatePresence(guild), 60000)
})

async function updatePresence(guild) {
    let name = config.prefix + "help (" + await db.getCounts() + " counts this week)";
    if (guild) name = "#" + guild.channels.get(await db.getChannel(guild.id)).name + " (" + await db.getCounts() + " counts this week)";
    client.user.setPresence({ status: "online", game: { name, type: "WATCHING" } })
}

async function processGuild(guild) {
    disabledGuilds.push(guild.id);

    let modules = await db.getModules(guild.id);
    
    if (modules.includes("recover")) {
        let countingChannel = await db.getChannel(guild.id);
        let channel = guild.channels.get(countingChannel)

        if (channel) {
            let c = await db.getCount(guild.id);
            let messages = await channel.fetchMessages({ limit: 100, after: c.message })
            if (messages.array().length > 0) {
                let botMsg = await channel.send("💢 Making channel ready for counting... \`Locking channel\`")
                await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: false })
                    .then(() => { botMsg.edit("💢 Making channel ready for counting... \`Channel locked. Deleting unprocessed entries.\`") })
                    .catch(() => { botMsg.edit("💢 Making channel ready for counting... \`Failed to lock channel. Deleting unprocessed entries.\`") })
                
                let processing = true;
                let fail = false;
                while (processing) {
                    let messages = await channel.fetchMessages({ limit: 100, after: c.message });
                    messages = messages.filter(m => m.id != botMsg.id);
                    if (messages.array().length < 1) processing = false;
                    else await channel.bulkDelete(messages)
                        .catch(() => { fail = true; });
                }

                await botMsg.edit("💢 Making channel ready for counting... \`" + (fail ? "Failed to delete." : "Deletion complete.") + " Restoring channel.\`");
                await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: true })
                    .then(() => { botMsg.edit("💢 Making channel ready for counting... \`Channel unlocked. Happy counting!\`") })
                    .catch(() => { botMsg.edit("💢 Making channel ready for counting... \`Failed to unlock channel.\`") })
                
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

client.login(config.token)

try { require("custom.js").shard(client, config) } catch(e) {} // This is custom code for the public Countr-bot. Please ignore.