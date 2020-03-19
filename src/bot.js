const Discord = require("discord.js"), fs = require("fs"), BLAPI = require("blapi"), config = require("../config.json"), argumentHandler = require("./arguments/handler.js");

const client = new Discord.Client({
  messageCacheLifetime: 30,
  messageSweepinterval: 60,
  disableMentions: "everyone",
  partials: [ "USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "CHANNEL" ],
  presence: {
    status: "idle",
    activity: {
      type: "WATCHING",
      name: "the loading screen"
    }
  }
}), db = require("./database.js")(client, config);

let shId = "Shard -1:", fails = {}, enabledGuilds = []

client.on("shardReady", async shardid => {
  shId = `Shard ${shardid}:`

  console.log(shId, `Ready as ${client.user.tag}`);
  
  enabledGuilds = [];

  const loadtime = true || await db.refreshAllGuilds();
  console.log(shId, `All ${client.guilds.cache.size} guilds' databases have been cached. [${loadtime}ms]`);

  await Promise.all(client.guilds.cache.map(processGuild))
  console.log(shId, "All guilds have been processed and is now ready.")

  updatePresence()
  client.setInterval(updatePresence, 60000)
})

async function updatePresence() {
  let name = config.prefix + `help (${await db.global.counts()} counts this week)`
  const guild = client.guilds.cache.get(config.mainGuild)
  if (guild) {
    const { channel, count } = await db.guild(guild.id).get();
    name = `#${guild.channels.cache.get(channel).name} (${count} counts so far)`
  }
  client.user.setPresence({ status: "online", activity: { name, type: "WATCHING" }})
}

// command handler
const commands = {}, aliases = {} // { "command": require("that_command") }, { "alias": "command" }
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) {
    const commandFile = require(`./commands/${file}`), fileName = file.replace(".js", "");
    commands[fileName] = commandFile;
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases[alias] = fileName;
  }
})

client.on("message", async message => {
  if (!message.guild || !enabledGuilds.includes(message.guild.id) || message.author.id == client.user.id || message.author.discriminator == "0000") return;

  const gdb = db.guild(message.guild.id); let { channel, count, user, modules, regex, timeoutrole, prefix } = gdb.get();
  if (channel == message.channel.id) {
    if (!message.member && message.author.id) try { message.member = await message.guild.member.fetch(message.author.id) } catch(e) {} // on bigger bots with not enough ram, not all members are loaded in. So if a member is missing, we try to load it in.
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

  if (!prefix) prefix = config.prefix;
  if (message.content.startsWith(prefix) || message.content.match(`^<@!?${client.user.id}> `)) {
    let content = message.content.split(" ")
    if (content[0].match(`^<@!?${client.user.id}>`)) content.shift(); else content = message.content.slice(prefix.length).split(" ")
    const identifier = content.shift().toLowerCase(), command = aliases[identifier] || identifier;
    content = content.join(" ")
    
    const args = content.match(/\".+\"|[^ ]+/g)

    const commandFile = commands[command], permissionLevel = getPermissionLevel(message.member);
    if (commandFile) {
      const strings = getStrings(message.guild.id, command, identifier, Object.keys(commandFile.usage).join(" ")); // we will use these regardless, so let's just get them now

      if (permissionLevel < commandFile.permissionLevel) return message.channel.send(`❌ ${strings.noPermission}`) 
      if (commandFile.checkArgs(args, permissionLevel) !== true) return message.channel.send(`❌ ${strings.invalidArguments}`)

      commandFile.run(client, message, args, gdb, strings, { config, prefix, permissionLevel, db, content })
    }
  } else if (message.content.match(`^<@!?${client.user.id}>`)) return message.channel.send(`👋 ${getStrings(message.guild.id).hello}`);
})

function getPermissionLevel(member) {
  if (config.admins[0] == member.user.id) return 5;
  if (config.admins.includes(member.user.id)) return 4;
  if (member.guild.ownerID == member.id) return 3;
  if (member.hasPermission("MANAGE_GUILD")) return 2;
  if (member.hasPermission("MANAGE_MESSAGES")) return 1;
  return 0;
}

function getStrings(guild, command = "", alias = "", usage = "") {
  const { language, prefix } = db.guild(guild).get();
  
  const strings = JSON.parse(JSON.stringify(require("../language/en.json"))) // Parse default language to avoid overwriting on the require function
  const lang = require(`../language/${language}.json`) // Get guild language file

  for (const string in lang) if (typeof strings[string] == "string") strings[string] = lang[string] // If some strings doesnt exist, we can use the english ones

  for (const string in strings) strings[string] = strings[string]
    .replace(/{{PREFIX}}/gm, prefix || config.prefix)
    .replace(/{{COMMAND}}/gm, command)
    .replace(/{{ALIAS}}/gm, alias)
    .replace(/{{USAGE}}/gm, usage)

  return strings;
}

async function processGuild(guild) {
  const gdb = await db.guild(guild.id);
  try {
    const { timeouts, timeoutrole, modules, channel: countingChannel, message } = await gdb.get();
    
    for (let userid in timeouts) {
      const user = guild.members.get(userid);
      if (user.roles.get(timeoutrole.role)) {
        if (Date.now() > timeouts[userid]) try { user.removeRole(timeoutrole.role, "User no longer timed out") } catch(e) {}
        else setTimeout(() => { try { user.removeRole(timeoutrole.role, "User no longer timed out") } catch(e) {}}, timeouts[userid] - Date.now())
      }
    }

    if (modules.includes("recover")) {
      const channel = guild.channels.get(countingChannel);

      if (channel) {
        let messages = await channel.messages.fetch({ limit: 1, after: message })
        if (messages.size) {
          const strings = getStrings(message.guild.id);
          let botMsg = await channel.send(`💢 ${strings.channelGettingReady}`)
          await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: false })

          let processing = true, fail = false;
          while (processing) {
            let messages = await channel.messages.fetch({ limit: 100, after: message });
            messages = messages.filter(m => m.id !== botMsg.id);
            if (messages.size == 0) processing = false;
            else await channel.bulkDelete(messages).catch(() => { processing = false; fail = true; })
          }

          await channel.overwritePermissions(guild.defaultRole, { SEND_MESSAGES: true })
          if (fail) botMsg.edit(`❌ ${strings.channelGettingReadyError}`)
          else botMsg.edit(`🔰 ${strings.channelGettingReadyDone}`).then(() => botMsg.delete(15000))
        }
      }
    }
  } catch(e) {}
  
  return enabledGuilds.push(guild.id)
}

client
  .on("error", err => console.log(shId, err))
  .on("rateLimit", rl => console.log(shId, `Rate-limited. [${rl.timeout}ms, ${rl.method} ${rl.path}]`))
  .on("shardDisconnect", event => console.log(shID, "Disconnected:", event.reason))
  .on("shardReconnecting", () => console.log(shId, "Reconnecting..."))
  .on("shardResume", (_, replayed) => console.log(shId, `Resumed. [${replayed} events replayed]`))
  .on("warn", info => console.log(shId, "Info:", info))
  .login(config.token);

if (config.listKeys && Object.values(config.listKeys).length) BLAPI.handle(client, config.listKeys, 15)