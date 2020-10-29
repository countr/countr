module.exports = {
  description: "Get the current scoreboard of the server.",
  usage: {},
  examples: {},
  aliases: [ "leaderboard", "^", "top" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
};

const config = require("../../config.json");

module.exports.run = async (message, _, gdb) => {
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
  }).catch(() => message.channel.send("🆘 I don't have permissions to use embeds in this channel."));
};

const medals = {
  "1st": "🥇",
  "2nd": "🥈",
  "3rd": "🥉"
};

function formatScore(id, index, users, userid = "") {
  let suffix = formatNumberSuffix(index + 1);
  suffix = medals[suffix] || `**${suffix}**:`;
  if (userid == id) return `${suffix} *__<@${id}>, **score:** ${users[id] || 0}__*`;
  else return `${suffix} <@${id}>, **score:** ${users[id] || 0}`;
}

function formatNumberSuffix(number) {
  let str = number.toString();

  if (str == "0") return "N/A";
  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return str + "th"; // ex. eleventh instead of elevenst
  if (str.endsWith("1")) return str + "st"; // ends on first
  if (str.endsWith("2")) return str + "nd"; // ends on second
  if (str.endsWith("3")) return str + "rd"; // ends on third
  return str + "th"; // ends on fourth, fifth, sixth etc.
}