module.exports = {
  description: "Get help on how to use the bot.",
  usage: {
    "[search ...]": "Something you want to search for, for example a command."
  },
  examples: {
    "help": "Get help on the command help. Oh wait, you already did."
  },
  aliases: [ "commands" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length <= 1
};

const fs = require("fs"), config = require("../../config.json");//, { generateTip } = require("../constants/index.js");

module.exports.run = async (message, _, gdb, { prefix, permissionLevel, content: searchQuery }) => {
  if (!searchQuery) return message.channel.send({
    embed: {
      title: `${message.client.user.username} Help`,
      description: [
        `• To get started with the bot, do \`${prefix}setup\`.`,
        `• If you need help with a command, do \`${prefix}help <command>\`.`,
        "• If you need further help, check out the documentation: https://docs.countr.xyz/"
      ].join("\n"),
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Requested by ${message.author.tag}`
      },
      fields: [
        {
          name: "Available commands",
          value: commands.filter(({ permissionRequired }) => permissionRequired <= permissionLevel).map(({ command }) => `\`${command}\``).filter(c => c).join(", "),
          inline: true
        }
      ]
    }
  })
  //.then(m => m.edit(generateTip(prefix)))
    .catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
  else {
    searchQuery = searchQuery.toLowerCase();
    let commandFile = commands.find(({ command, aliases }) => searchQuery == command || aliases.includes(searchQuery));
    if (!commandFile) commandFile = commands.find(({ description }) => description.toLowerCase().includes(searchQuery));
    if (!commandFile) return message.channel.send("❌ No command was found with your search.");

    return message.channel.send({
      embed: {
        title: `Help: ${commandFile.command}`,
        description: commandFile.description,
        color: config.color,
        timestamp: Date.now(),
        footer: {
          icon_url: message.author.displayAvatarURL(),
          text: `Requested by ${message.author.tag}`
        },
        fields: [
          {
            name: "Usage",
            value: Object.keys(commandFile.usage).length ? `\`${prefix}${commandFile.command}${Object.keys(commandFile.usage).map(a => ` ${a}`).join("")}\`${Object.keys(commandFile.usage).map(a => `\n• \`${a}\`: ${commandFile.usage[a]}`).join("")}` : null
          },
          {
            name: "Examples",
            value: Object.keys(commandFile.examples).length ? Object.keys(commandFile.examples).map(ex => `• \`${prefix}${commandFile.command}${ex ? ` ${ex}` : ""}\`: ${commandFile.examples[ex]}`).join("\n") : null
          },
          {
            name: "Permission Level",// 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
            value: `${commandFile.permissionRequired}: ${["All", "Mods", "Admins", "Server Owner", "Bot Admin", "Bot Owner"][commandFile.permissionRequired]} ${permissionLevel >= commandFile.permissionRequired ? "✅" : "❌"}`,
            inline: true
          },
          {
            name: "Aliases",
            value: commandFile.aliases.length ? commandFile.aliases.map(a => `\`${a}\``).join(", ") : null,
            inline: true
          }
        ].filter(f => f.value)
      }
    })
    //.then(m => m.edit(generateTip(prefix)))
      .catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
  }
};

// loading commands
let commands = [], defaultCommand = {
  description: "Undocumented.",
  usage: {},
  examples: {},
  aliases: [], // all except the first trigger
  permissionRequired: 0
};

const loadCommandDescriptions = () => {
  commands = [];

  for (const static of require("./_static.json")) if (!static.hideFromHelp) commands.push(Object.assign({}, defaultCommand, {
    description: "Static command.",
    aliases: static.triggers.slice(1), // all except the first trigger
    command: static.triggers[0] // the first trigger
  }));
  
  fs.readdir("./src/commands/", (err, files) => {
    if (err) return console.log(err);
    for (const file of files) if (file.endsWith(".js")) {
      const commandFile = Object.assign({}, require(`../commands/${file}`)), fileName = file.replace(".js", "");
      commandFile.command = fileName;
      if (config.isPremium || !commandFile.premiumOnly) commands.push(Object.assign({}, defaultCommand, commandFile));
    }
    // sort the commands list by name once all commands have been loaded in
    commands = commands.sort((a, b) => a.command.localeCompare(b.command));
  });
};

loadCommandDescriptions();
module.exports.loadCommandDescriptions = loadCommandDescriptions;