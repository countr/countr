module.exports = {
  description: "Get the current scoreboard of the server.",
  usage: {},
  examples: {},
  aliases: [ "leaderboard", "^", "top" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
};

const config = require("../../config.json"), { /*generateTip, */formatScore } = require("../constants/index.js");

module.exports.run = async (message, _, gdb, { prefix }) => {
  const
    { users } = gdb.get(),
    sorted = Object.keys(users).sort((a, b) => users[b] - users[a]),
    top = sorted.slice(0, 25),
    leaderboard = top.map((id, index) => formatScore(id, index, users, message.author.id));
  let description = leaderboard.join("\n");
  if (!top.includes(message.author.id)) {
    if (leaderboard.length) description = description + "\n^^^^^^^^^^^^^^^^^^^^^^^^^\n";
    description = description + formatScore(message.author.id, sorted.indexOf(message.author.id), users);
  }

  return message.channel.send({
    embed: {
      author: {
        name: `${message.guild.name} Scoreboard`,
        icon_url: message.guild.iconURL({ dynamic: true, size: 128 })
      },
      description,
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Requested by ${message.author.tag}`
      }
    }
  })
  //.then(m => m.edit(generateTip(prefix)))
    .catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
};