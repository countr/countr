module.exports = {
  description: "Get help on how to use the bot. Will time out after one minute of inactivity.",
  usage: {
    "[-all]": "If you include this, it will show all the commands excluding bot-admins-only commands.",
    "[<search ...>]": "Search for a specific command, category or related."
  },
  examples: [
    ""
  ],
  aliases: ["commands", "?"],
  permissionRequired: 0,
  checkArgs: (args) => {
    return true;
  }
}

const fs = require("fs");

module.exports.run = async function(client, message, args, config, db, { permissionLevel, prefix }) {
  let permission = permissionLevel;
  if (args[0] == "-all") { permission = 2; args.shift(); }

  let search = args.join(" "), commandsFound = [];
  for (var command in allCommands) if (allCommands[command].permissionRequired <= permission && [
    command.includes(search),
    allCommands[command].description.includes(search),
    Object.keys(allCommands[command].usage).includes(search),
    Object.values(allCommands[command].usage).includes(search)
  ].includes(true)) items.push({
    name: prefix + command,
    value: [
      "**Description:** " + allCommands[command].description,
      "**Permission Level Required:** " + ["None", "Chat Moderators", "Server Administrators", "Bot Support Team", "Bot Owner"][allCommands[command].permissionRequired] + (permission !== permissionLevel ? " \`" + (permissionLevel >= allCommands[command].permissionRequired ? "✅" : "❌") + "\`" : ""),
      "**Usage:** \`" + prefix + command + Object.keys(allCommands[command].usage).map(arg => " " + arg).join("") + "\`",
      "**Arguments:** " + (Object.keys(allCommands[command].usage).map(arg => "\n- \`" + arg + "\`: " + allCommands[command].usage[arg]).join("") || "None."),
      "**Examples:**" + (Object.keys(allCommands[command].examples).map(ex => "\n- \`" + prefix + command + " " + ex + "\`: " + allCommands[command].examples[ex]).join("") || "None.")
    ].join("\n"),
    inline: true
  })

  message.channel.send({embed: {
    description: [
      "`[<x>]` means it is optional to include value, `<x>` means it is required to include value,",
      "`[x]` means it is optional to include \"x\", `x` means it is required to include \"x\"`.",
      search.length ? "\n**Search query:** \`" + search + "\`" : ""
    ].filter(s => s.length).join("\n"),
    color: config.color,
    footer: { text: "Requested by " + message.author.tag, iconURL: message.author.displayAvatarURL.split("?")[0] }
  }}).then(botMsg => {
    
  }).catch(() => message.channel.send("❌ An unknown error occoured. Do I have permission? (Embed Links)"))
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