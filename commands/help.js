module.exports = {
  description: "Get help on how to use the bot. Will time out after one minute of inactivity.",
  usage: {
    "[-all]": "If you include this, it will show all the commands excluding bot-admins-only commands.",
    "[<search ...>]": "Search for a specific command, category or related."
  },
  examples: {
    "notifyme": "Will give you infomation about the notifyme-command.",
    "-all add": "Will give you all commands that have \"add\" in their command, description or usage."
  },
  aliases: ["commands", "?"],
  permissionRequired: 0,
  checkArgs: (args) => {
    return true;
  }
}

const fs = require("fs");

module.exports.run = async function(client, message, args, config, gdb, { permissionLevel, prefix }) {
  let permission = permissionLevel;
  if (args[0] == "-all") { permission = 2; args.shift(); }

  let search = args.join(" "), commandsFound = [];
  for (var command in allCommands) if (allCommands[command].permissionRequired <= permission && [
    command.includes(search),
    (prefix + command).includes(search),
    allCommands[command].description.includes(search),
    Object.keys(allCommands[command].usage).includes(search),
    Object.values(allCommands[command].usage).includes(search),
    Object.values(allCommands[command].examples).includes(search)
  ].includes(true)) commandsFound.push({
    name: prefix + command,
    value: [
      "**Description:** " + allCommands[command].description,
      "**Permission Level Required:** " + ["None", "Chat Moderators", "Server Administrators", "Bot Support Team", "Bot Owner"][allCommands[command].permissionRequired] + (permission !== permissionLevel ? " \`" + (permissionLevel >= allCommands[command].permissionRequired ? "✅" : "❌") + "\`" : ""),
      "**Usage:** \`" + prefix + command + Object.keys(allCommands[command].usage).map(arg => " " + arg).join("") + "\`",
      "**Arguments:** " + (Object.keys(allCommands[command].usage).map(arg => "\n- \`" + arg + "\`: " + allCommands[command].usage[arg]).join("") || "None."),
      "**Examples:** " + (Object.keys(allCommands[command].examples).map(ex => "\n- \`" + prefix + command + " " + ex + "\`: " + allCommands[command].examples[ex]).join("") || "None.")
    ].join("\n"),
  inline: false
  })

  let pages = Math.ceil(commandsFound.length / 5), page = 1;

  const help = {embed: {
    description: [
      "`[<val>]` means it is optional to include a value, `<val>` means it is required to include a value,",
      "`[xyz]` means it is optional to include \"xyz\", `xyz` means it is required to include \"xyz\".",
      search.length ? "\n**Found **\`" + commandsFound.length + "\`** results with query:** \`" + search + "\`" : "\n**Found **\`" + commandsFound.length + "\`** commands.**"
    ].filter(s => s.length).join("\n"),
    color: config.color,
    fields: commandsFound.slice(0, 5), // only show the 5 first elements
    footer: { text: "Requested by " + message.author.tag + (pages > 1 ? " • Page " + page + " of " + pages : ""), icon_url: message.author.displayAvatarURL },
    timestamp: Date.now()
  }}

  message.channel.send(help).then(async botMsg => {
    if (pages > 1) await botMsg.react("♻️") && await botMsg.react("⬅️") && await botMsg.react("➡️");
    botMsg.react("❌")
    
    let timedout = false
    while (!timedout) try {
      let collected = await botMsg.awaitReactions((_, user) => user.id == message.author.id, { errors: [ "time" ], time: 120000, maxEmojis: 1 })
      let reaction = collected.first();

      if (reaction.emoji == "♻️") page = 1;
      else if (reaction.emoji == "⬅️") page -= 1;
      else if (reaction.emoji == "➡️") page += 1;
      else if (reaction.emoji == "❌") return botMsg.edit("🔰 Closed by user. Open it again with \`" + prefix + "help\`.", {embed:{}}) && botMsg.clearReactions();

      if (page < 1) page = 1; // if they try accessing a page below page one, we restrict them
      else if (page > pages) page = pages; // if they try accessing a page that does not exist, we restrict them.
      
      reaction.remove(message.author.id);
      
      if (JSON.stringify(help.embed.fields) !== JSON.stringify(commandsFound.slice((page - 1) * 5, page * 5))) { // we don't want to excessively rate limit the bot if they try to access a page that does not exist
        help.embed.fields = commandsFound.slice((page - 1) * 5, page * 5)
        help.embed.footer.text = "Requested by " + message.author.tag + " • Page " + page + " of " + pages
        botMsg.edit(help)
      }
    } catch(e) { // the timer went out
      console.log(e)
      timedout = true
      return botMsg.edit("⏲️ Timed out. Open it again with \`" + prefix + "help\`.", {embed:{}}) && botMsg.clearReactions();
    }
  }).catch(() => message.channel.send("🆘 An unknown error occoured. Do I have permission? (Embed Links, Add Reactions, Manage Messages)"))
}

const allCommands = {}
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err)
  for (var file of files) if (file.endsWith(".js")) {
    const commandFile = require("./" + file);

    const info = {}
    info.description = commandFile.description;
    info.usage = commandFile.usage;
    info.examples = commandFile.examples;
    info.permissionRequired = commandFile.permissionRequired;
    
    allCommands[file.replace(".js", "")] = info;
  }
})