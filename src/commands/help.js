const { config } = require("process");

module.exports = {
  description: "Get help on how to use the bot.",
  usage: {
    "[-all]": "If you include this, it will show all the commands excluding bot-admins-only commands.",
    "[<search ...>]": "Search for a specific command, category or related."
  },
  examples: {
    "notifyme": "Will give you infomation about the notifyme-command.",
    "-all add": "Will give you all commands that have \"add\" in their command, description or usage."
  },
  aliases: [ "commands", "?" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: () => true
}

const fs = require("fs"), permissionLevels = [ "None", "Moderators", "Administrators", "Server Owner", "Bot Administrator", "Bot Owner" ], config = require("../../config.json")

// loading commands
const allCommands = {};
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) {
    const { description, usage, examples, permissionRequired, aliases } = require(`./${file}`), commandName = file.replace(".js", "");
    allCommands[commandName] = { description, usage, examples, permissionRequired, aliases };
  }
  console.log(allCommands)
})

module.exports.run = async (message, args, gdb, strings, { prefix, permissionLevel, content: search }) => {
  let permission = permissionLevel;
  if (search.startsWith("-all ") || search == "-all") {
    permission = 2;
    if (search == "-all") search = "";
    else search.slice(5);
  }

  if (search.length > 20 || search.includes("\n")) return message.channel.send(`❌ ${strings.commandHelpInvalidSearchQuery} ${strings.help}`)

  if (allCommands[search] || allCommands[search.slice(prefix.length)]) return message.channel.send({
    embed: {
      // TODO embed for single command
    }
  })

  const commandsFound = [];
  for (const commandName in allCommands) {
    const command = allCommands[commandName];
    if (command.permissionRequired <= permission && (
      (prefix + commandName).includes(search) ||
      command.description.includes(search) ||
      command.aliases.find(alias => alias.includes(search)) ||
      Object.values(command.usage).find(usage => usage.includes(search)) ||
      Object.values(command.examples).find(example => example.includes(search))
    )) commandsFound.push({
      name: `\`${prefix}${commandName}${Object.keys(command.usage).map(arg => " " + arg).join("")}\``,
      value: [
        `**Description:** ${command.description}`,
        `**Permission:** ${permissionLevels[command.permissionRequired]}`,
        (command.aliases && command.aliases.length) ? `**Aliases:** ${command.aliases.map(alias => `\`${alias}\``).join(", ")}` : null,
        `**More information:** \`${prefix}help ${commandName}\``
      ].filter(str => str).join("\n"),
      inline: false
    })
  }

  const pageCount = Math.ceil(commandsFound.length / 8);
  let currentPage = 1;

  const embed = {
    title: `📋 Commands`,
    description: [
      "", // TODO uhhhh idk something here explaining the formatting
      search.length ? `**Found ${commandsFound.length} results matching your search.**` : `**Displaying ${commandsFound.length} commands.`
    ].join("\n"),
    color: config.color,
    fields: commandsFound.slice(0, 5), // only show the first eight commands
    timestamp: Date.now(),
    footer: {
      text: `Requested by ${message.author.tag} • Page ${currentPage} of ${pageCount}`,
      icon_url: message.author.displayAvatarURL()
    }
  }

  message.channel.send({ embed }).then(async helpMessage => {
    if (pages > 1) reactMultipleAsync(helpMessage, [ "♻", "⬅", "➡", "❌" ]);
    else helpMessage.react("❌");

    while (true) try {
      const oldPage = currentPage, collected = await helpMessage.awaitReactions((reaction, user) => user.id == message.author.id, { errors: [ "time" ], time: 180000, maxEmojis: 1 }), reaction = collected.first();
      switch(reaction.emoji) {
        case "♻":
          currentPage = 1;
          break;
        case "⬅":
          currentPage--;
          break;
        case "➡":
          currentPage++;
          break;
        case "❌":
          return helpMessage.edit(`✔ ${commandHelpClosedByUser}`, { embed: {}}) && helpMessage.clearReactions().catch();
      }

      if (currentPage < 1) currentPage = 1;
      if (currentPage > pageCount) currentPage = pageCount;

      reaction.users.remove(message.author);

      if (oldPage !== currentPage) {
        embed.fields = commandsFound.slice((currentPage - 1) * 5, currentPage * 5);
        embed.footer.text = `Requested by ${message.author.tag} • Page ${currentPage} of ${pageCount}`
        helpMessage.edit({ embed })
      }
    } catch(e) {
      return helpMessage.edit(`⌛ ${commandHelpTimedOut}`, { embed: {}}) && helpMessage.clearReactions().catch();
    }
  }).catch(() => message.channel.send(`🆘 ${strings.missingPermission} (${strings.permissionEmbedLinks}, ${strings.permissionAddReactions}, ${strings.permissionManageMessages})`))
}

async function reactMultipleAsync(message, emojis) {
  for (const emoji of emojis) {
    await message.react(emoji);
    await new Promise(resolve => setInterval(resolve, 500))
  }
}