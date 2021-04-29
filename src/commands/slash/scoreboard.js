const config = require("../../../config.json"), { formatScore } = require("../../constants/index.js");

module.exports = {
  description: "Get the current scoreboard of the server.",
  options: []
};

module.exports.run = async (send, { member, gdb, guild, client }) => {
  const
    { users } = gdb.get(),
    sorted = Object.keys(users).sort((a, b) => users[b] - users[a]),
    top = sorted.slice(0, 25),
    leaderboard = top.map((id, index) => formatScore(id, index, users, member.user.id));
  let description = leaderboard.join("\n");
  if (!top.includes(member.user.id)) {
    if (leaderboard.length) description = description + "\n^^^^^^^^^^^^^^^^^^^^^^^^^\n";
    description += formatScore(member.user.id, sorted.indexOf(member.user.id), users);
  }

  const g = client.guilds.resolve(guild), u = await client.users.fetch(member.user.id, false);

  send({
    embeds: [{
      author: {
        name: `${g.name} Scoreboard`,
        icon_url: g.iconURL({ dynamic: true, size: 128 })
      },
      description,
      color: config.color,
      timestamp: (new Date()).toISOString(),
      footer: {
        icon_url: u.displayAvatarURL(),
        text: `Requested by ${u.tag}`
      }
    }]
  });
};
