const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("./config.json")

const client = new Discord.Client({ messageSweepInterval: 60, messageCacheLifetime: 5, disableEveryone: true, disabledEvents: ["TYPING_START", "PRESENCE_UPDATE", "GUILD_BAN_ADD", "GUILD_BAN_REMOVE", "USER_NOTE_UPDATE", "USER_SETTINGS_UPDATE", "VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE"], restTimeOffset: 200 }), shId = client.shard ? "Shard " + client.shard.id + ": " : "";
const db = require("./database.js")(client, config), fails = {};

client.on("ready", async () => {
  console.log(shId + "Ready as " + client.user.tag);
  client.user.setPresence({ status: "idle", game: { name: "the loading screen", type: "WATCHING" }})

  client.guilds.forEach(processGuild)
})

setInterval(async () => {
  if (!client.guilds.size) return; // client is not ready yet, or have lost connection
  let name = config.prefix + "help (" + await db.global.counts() + " counts this week)"
  let guild = client.guilds.get(config.mainGuild)
  if (guild) {
    const {channel, count} = await db.guild(guild.id).get();
    name = "#" + guild.channels.get(channel).name + " (" + count + " counts so far)"
  }
  client.user.setPresence({ status: "online", game: { name, type: "WATCHING" } })
}, 60000)

// command handler
const commands = {}, aliases = {} // { "command": require("that_command") }, { "alias": "command" }
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  for (let file of files) if (file.endsWith(".js")) {
    let commandFile = require("./commands/" + file), fileName = file.replace(".js", "")
    commands[fileName] = commandFile
    if (commandFile.aliases) for (let alias of commandFile.aliases) aliases[alias] = fileName
  }
})

client.on("message", async message => {
  if (!message.guild || message.author.id == client.user.id || message.author.discriminator == "0000") return;

  const gdb = await db.guild(message.guild.id); let {channel, count, user, modules, regex, timeoutrole, prefix} = await gdb.get();
  if (channel == message.channel.id) {
    if (!message.member && message.author.id) try { message.member = await message.guild.fetchMember(message.author.id, true) } catch(e) {} // on bigger bots with not enough ram, not all members are loaded in. So if a member is missing, we try to load it in.

    if (message.webhookID == null && (disabledGuilds.includes(message.guild.id) || message.author.bot)) return message.delete();
    if (message.webhookID || (message.content.startsWith("!") && getPermissionLevel(message.member) >= 1) || message.type !== "DEFAULT") return;

    let regexMatches = false;
    if (regex.length && getPermissionLevel(message.member) == 0) for (let r of regex) if ((new RegExp(r, 'g')).test(message.content)) regexMatches = true;

    if ((!modules.includes("allow-spam") && message.author.id == user) || message.content.split(" ")[0] !== (count + 1).toString() || (!modules.includes("talking") && message.content !== (count + 1).toString()) || regexMatches) {
      if (timeoutrole.role) {
        if (!fails[message.guild.id + "/" + message.author.id]) fails[message.guild.id + "/" + message.author.id] = 0;
        ++fails[message.guild.id + "/" + message.author.id];

        setTimeout(() => --fails[message.guild.id + "/" + message.author.id], timeoutrole.time * 1000)

        if (fails[message.guild.id + "/" + message.author.id] >= timeoutrole.fails) {
          if (timeoutrole.duration) await gdb.addTimeout(message.author.id, timeoutrole.duration)
          try {
            await message.member.addRole(timeoutrole.role, "User timed out")
            if (timeoutrole.duration) setTimeout(() => message.member.removeRole(timeoutrole.role, "User no longer timed out"), timeoutrole.duration * 1000)
          } catch(e) {}
        }
      }
      return message.delete();
    }

    ++count; gdb.addToCount(message.member)

    let msg = message;
    try {
      if (modules.includes("webhook")) await message.channel.fetchWebhooks().then(async webhooks => {
        let webhook = webhooks.find(wh => wh.name == "Countr");
        if (!webhook) webhook = await message.channel.createWebhook("Countr").catch(() => null);

        if (webhook) {
          msg = await webhook.send(message.content, { username: message.author.username, avatarURL: message.author.displayAvatarURL.split("?")[0] }) // "".split("?")[0]"" removes the optional "?size=xxx" in the URL
          message.delete();
        }
      });
      else if (modules.includes("reposting")) await message.channel.send({embed: {
        description: "<@!" + message.author.id + ">: " + message.content,
        color: message.member.displayColor || 3553598
      }}).then(newMsg => { msg = newMsg; message.delete(); })
    } catch(e) {} // if it doesn't work, we still have the original "msg" value we can pass on further.

    return gdb.doStuffAfterCount(count, message.member, msg);
  }
  
  if (!prefix) prefix = config.prefix

  if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) {
    if (!message.member && message.author.id) try { message.member = await message.guild.fetchMember(message.author.id, true) } catch(e) {} // on bigger bots with not enough ram, not all members are loaded in. So if a member is missing, we try to load it in.

    let args = message.content.split(" ");
    if (args[0].match(`^<@!?${client.user.id}>`)) args.shift(); else args = message.content.slice(prefix.length).split(" ");
    const identifier = args.shift().toLowerCase(), command = aliases[identifier] || identifier

    const commandFile = commands[command], permissionLevel = getPermissionLevel(message.member)
    if (commandFile) {
      if (permissionLevel < commandFile.permissionRequired) return message.channel.send("❌ You don't have permission to do this!");
      if (commandFile.checkArgs(args, permissionLevel) !== true) return message.channel.send("❌ Invalid arguments! Usage is `" + prefix + command + Object.keys(commandFile.usage).map(a => " " + a).join("") + "\`, for additional help type `" + prefix + "help " + command + "`.");
      
      commandFile.run(client, message, args, config, gdb, prefix, permissionLevel, db)
    }
  } else if (message.content.match(`^<@!?${client.user.id}>`)) return message.channel.send("👋 My prefix is `" + prefix + "`, for help type `" + prefix + "help`.");
})

let getPermissionLevel = (member) => {
  if (config.admins[0] == member.user.id) return 5;
  if (config.admins.includes(member.user.id)) return 4;
  if (member.guild.owner.id == member.id) return 3;
  if (member.hasPermission("MANAGE_GUILD")) return 2;
  if (member.hasPermission("MANAGE_MESSAGES")) return 1;
  return 0;
}

let disabledGuilds = [];
async function processGuild(guild) {
  disabledGuilds.push(guild.id);

  const gdb = await db.guild(guild.id);
  try {
    const {timeouts, timeoutrole, modules, channel: countingChannel, message} = await gdb.get();
    
    for (let userid in timeouts) try {
      if (Date.now() > timeouts[userid]) guild.members.get(userid).removeRole(timeoutrole.role, "User no longer timed out");
      else setTimeout(() => { try { guild.members.get(userid).removeRole(timeoutrole.role) } catch(e) {}}, timeouts[userid] - Date.now(), "User no longer timed out")
    } catch(e) {}

    if (modules.includes("recover")) {
      const channel = guild.channels.get(countingChannel);

      if (channel) {
        let messages = await channel.fetchMessages({ limit: 1, after: message })
        if (messages.size) {
          let botMsg = await channel.send("💢 Making the channel ready for counting, please wait ...")
          await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: false })

          let processing = true, fail = false;
          while (processing) {
            let messages = await channel.fetchMessages({ limit: 100, after: message });
            messages = messages.filter(m => m.id !== botMsg.id);
            if (messages.size == 0) processing = false;
            else await channel.bulkDelete(messages).catch(() => { processing = false; fail = true; })
          }

          await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: true })
          if (fail) await botMsg.edit("❌ Could not delete messages. Do I have permission? (Manage Messages)")
          else await botMsg.edit("🔰 Channel is ready! Happy counting!").then(() => botMsg.delete(15000))
        }
      }
    }
  } catch(e) {} return disabledGuilds = disabledGuilds.filter(g => g !== guild.id)
}

client
  .on("messageDelete", async message => {
    if (!message.guild || message.author.bot) return;

    const gdb = await db.guild(message.guild.id), {channel, message: lastMessage} = await gdb.get();
    if (message.channel.id == channel && message.id == lastMessage) return message.channel.send(message.content + " (" + message.author.toString() + ")").then(m => gdb.set("message", m.id)) // resend if the last count got deleted
  })
  .on("messageUpdate", async (message, newMessage) => {
    if (!message.guild || message.author.bot) return;

    const gdb = await db.guild(message.guild.id), {channel, message: lastMessage, modules, regex} = await gdb.get();

    if (message.channel.id == channel && message.id == lastMessage && message.content !== newMessage.content) {
      let regexMatches = false;
      if (regex.length && getPermissionLevel(message.member) == 0) for (let r of regex) if ((new RegExp(r, 'g')).test(message.content)) regexMatches = true;
      
      if (!(modules.includes("talking") && message.content.split(" ")[0] == newMessage.content.split(" ")[0]) || regexMatches)
        return message.channel.send(message.content + " (" + message.author.toString() + ")").then(m => message.delete() && gdb.set("message", m.id)) // resend if the last count got edited
    }
  })

  .on("rateLimit", rl => console.log(shId + "Rate limited. [" + rl.timeDifference + "ms, endpoint: " + rl.path + ", limit: " + rl.limit + "]"))
  .on("disconnect", dc => console.log(shId + "Disconnected:", dc))
  .on("reconnecting", () => console.log(shId + "Reconnecting..."))
  .on("resume", replayed => console.log(shId + "Resumed. [" + replayed + " events replayed]"))
  .on("error", err => console.log(shId + "Unexpected error:", err))
  .on("warn", warn => console.log(shId + "Unexpected warning:", warn))
  .login(config.token)

if (Object.values(config.listKeys).length) BLAPI.handle(client, config.listKeys, 15);