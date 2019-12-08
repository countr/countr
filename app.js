const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("./config.json")

const client = new Discord.Client({ messageSweepInterval: 60, disableEveryone: true, disabledEvents: ["TYPING_START"] }), shId = client.shard ? "Shard " + client.shard.id + ": " : "";
const db = require("./database.js")(client, config), fails = {};

client.on("ready", async () => {
  console.log(shId + "Ready as " + client.user.tag);
  client.user.setPresence({ status: "idle", game: { name: "the loading screen", type: "WATCHING" }})

  client.guilds.forEach(processGuild)
})

setInterval(async () => {
  if (!client.guilds.size) return; // client is not ready yet, or have lost connection
  var name = config.prefix + "help (" + await db.global.counts() + " counts this week)"
  var guild = client.guilds.get(config.mainGuild)
  if (guild) {
    const {channel, count} = await db.guild(guild.id).get();
    name = "#" + guild.channels.get(channel).name + " (" + count + " counts so far)"
  }
  client.user.setPresence({ status: "online", game: { name, type: "WATCHING" } })
}, 60000)

// command handler
const commands = {} // { "command": require("that_command") }
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  for (var file of files) if (file.endsWith(".js")) {
    let commandFile = require("./commands/" + file)
    commands[file.replace(".js", "")] = commandFile
    if (commandFile.aliases) for (var alias of commandFile.aliases) commands[alias] = commandFile
  }
  console.log("Cached " + Object.keys(commands).length + " commands.")
})

client.on("message", async message => {
  if (!message.guild || message.author.id == client.user.id || message.author.discriminator == "0000") return;

  const gdb = await db.guild(message.guild.id); let {channel, count, user, modules, regex, timeoutrole, prefix} = await gdb.get();
  if (channel == message.channel.id) {
    if (!message.member && message.author.id) try { message.member = await message.guild.fetchMember(message.author.id, true) } catch(e) {} // on bigger bots with not enough ram, not all members are loaded in. So if a member is missing, we try to load it in.

    if (message.webhookID == null && (disabledGuilds.includes(message.channel.id) || message.author.bot)) return message.delete();
    if (message.webhookID || (message.content.startsWith("!") && getPermissionLevel(message.member) >= 1) || message.type !== "DEFAULT") return;

    let regexMatches = false;
    if (regex.length && getPermissionLevel(message.member) == 0) for (var r of regex) if ((new RegExp(r, 'g')).test(message.content)) regexMatches = true;

    if ((!modules.includes("allow-spam") && message.author.id == user) || message.content.split(" ")[0] !== (count + 1).toString() || (!modules.includes("talking") && message.content !== (count + 1).toString()) || regexMatches) {
      if (timeoutrole.role) {
        if (!fails[message.guild.id + "/" + message.author.id]) fails[message.guild.id + "/" + message.author.id] = 0;
        ++fails[message.guild.id + "/" + message.author.id];

        setTimeout(() => --fails[message.guild.id + "/" + message.author.id], timeoutrole.time * 1000)

        if (fails[message.guild.id + "/" + message.author.id] >= timeoutrole.fails) {
          if (timeoutrole.duration) await gdb.addTimeout(message.guild.id, message.author.id, timeoutrole.duration)
          try {
            await message.member.addRole(timeoutrole.role, "User timed out")
            if (timeoutrole.duration) setTimeout(() => message.member.removeRole(timeoutrole.role, "User no longer timed out"), timeoutrole.duration * 1000)
          } catch(e) {}
        }
      }
      return message.delete();
    }

    ++count; gdb.addToCount(message.author.id).then(() => gdb.checkRole(message.author.id, count))

    var msg = message;
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

    return gdb.doStuffAfterCount(count, message.author.id, msg);
  }
  
  if (!prefix) prefix = config.prefix

  if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) {
    if (!message.member && message.author.id) try { message.member = await message.guild.fetchMember(message.author.id, true) } catch(e) {} // on bigger bots with not enough ram, not all members are loaded in. So if a member is missing, we try to load it in.

    const args = message.content.split(" ");
    if (args[0].match(`^<@!?${client.user.id}>`)) args.shift(); else args[0] = args[0].slice(prefix.length);
    const command = args.shift().toLowerCase()

    const commandFile = commands[command], permissionLevel = getPermissionLevel(message.member)
    if (commandFile) {
      if (permissionLevel < commandFile.permissionRequried) return message.channel.send("❌ You don't have permission! For help type `" + prefix + "help " + command + "`.");
      if (commandFile.checkArgs(args, permissionLevel) !== true) return message.channel.send("❌ Invalid arguments! For help type `" + prefix + "help " + command + "`.");
      
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
    const {timeouts, timeoutrole, modules, channel: countingChannel, count} = await gdb.get();
    
    for (var userid in timeouts) try {
      if (Date.now() > timeouts[userid]) guild.members.get(userid).removeRole(timeoutrole.role, "User no longer timed out");
      else setTimeout(() => guild.members.get(userid).removeRole(timeoutrole.role), timeouts[userid] - Date.now(), "User no longer timed out")
    } catch(e) {}

    if (modules.includes("recover")) {
      const channel = guild.channels.get(countingChannel);

      if (channel) {
        let messages = await channel.fetchMessages({ limit: 1, after: count.message })
        if (messages.size > 0) {
          let botMsg = await channel.send("💢 Making the channel ready for counting, please wait ...")
          await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: false })

          let processing = true, fail = false;
          while (processing) {
            let messages = await channel.fetchMessages({ limit: 100, after: count.message });
            messages = messages.filter(m => m.id !== botMsg.id);
            if (messages.size == 0) processing = false;
            else await channel.bulkDelete(messages).catch(() => fail = true)
          }

          await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: true })
          await botMsg.edit("🔰 Channel is ready! Happy counting!")
          botMsg.delete(15000);
        }
      }
    }
  } catch(e) {} return disabledGuilds = disabledGuilds.filter(g => g !== guild.id)
}

client
  .on("messageDelete", async message => {
    if (!message.guild || message.author.bot) return;

    const gdb = await db.guild(message.guild.id), {channel, message: lastMessage} = await gdb.get();
    if (message.channel.id == channel && message.id == lastMessage) return message.channel.send(message.content + " (" + message.author.toString() + ")").then(m => gdb.setLastMessage(m.id)) // resend if the last count got deleted
  })
  .on("messageUpdate", async (oldMessage, message) => {
    if (!message.guild || message.author.bot) return;

    const gdb = await db.guild(message.guild.id), {channel, message: lastMessage} = await gdb.get();
    if (message.channel.id == channel && message.id == lastMessage) return message.channel.send(oldMessage.content + " (" + message.author.toString() + ")").then(m => message.delete() && db.setLastMessage(m.id)) // resend if the last count git edited
  })

  .on("rateLimit", rl => console.log(shId + "Rate limited. [" + rl.timeDifference + "ms, endpoint: " + rl.path + "]"))
  .on("disconnect", dc => console.log(shId + "Disconnected:", dc))
  .on("reconnecting", () => console.log(shId + "Reconnecting..."))
  .on("resume", replayed => console.log(shId + "Resumed. [" + replayed + " events replayed]"))
  .on("error", error => console.log(shId + "Unexpected error:", err))
  .on("warn", warn => console.log(shId + "Unexpected warning:", warn))
  .login(config.token)

if (Object.values(config.listKeys).length) BLAPI.handle(client, config.listKeys, 15);