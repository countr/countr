module.exports = {
  description: "Get the current leaderboard of the server.",
  usage: {},
  examples: {},
  aliases: [ "leaderboard", "^", "top" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  const { users } = await gdb.get();

  const sorted = Object.keys(users).sort((a, b) => users[b] - users[a]), topusers = sorted.filter(u => users[u]).slice(0, 25), leaderboard = topusers.map((id, index) => formatScore(id, index, users));

  let description = leaderboard.join("\n");
  if (!topusers.includes(message.author.id)) {
    if (leaderboard.length) description = description + "\n^^^^^^^^^^^^^^^^^^^^^^^^^\n"
    description = description + formatScore(message.author.id, sorted.indexOf(message.author.id), users)
  }

  message.channel.send({
    embed: {
      author: {
        name: message.guild.name + " Scoreboard",
        icon_url: message.guild.iconURL
      },
      description,
      color: config.color
    }
  }).catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
}

const medals = {
  "1st": "🥇",
  "2nd": "🥈",
  "3rd": "🥉"
}

function formatScore(id, index, users) {
  let suffix = formatNumberSuffix(index + 1);
  suffix = medals[suffix] || "**" + suffix + "**:"
  return suffix + " <@" + id + ">, **score:** " + (users[id] || 0);
}

function formatNumberSuffix(number) {
  let str = number.toString()

  if (str == "0") return "N/A"

  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return str + "th" // ex. eleventh instead of elevenst

  if (str.endsWith("1")) return str + "st"; // ends on first
  if (str.endsWith("2")) return str + "nd"; // ends on second
  if (str.endsWith("3")) return str + "rd"; // ends on third
  return str + "th" // ends on fourth, fifth, sixth etc.
}