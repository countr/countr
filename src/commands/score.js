module.exports = {
  description: "Get your current score and rank in the server",
  usage: {
    "[member]": "The member you want to check the score of"
  },
  examples: {},
  aliases: [ "rank", "#" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 0 || args.length >= 1
};

const { getMember, getChannel } = require("../constants/index.js");

module.exports.run = async (message, _, gdb, { content }) => {
  let member = content ? await getMember(content, message.guild) : message.member;
  if (!member) member = message.member;
  const
    self = message.member == member ? true : false,
    { users, channel } = gdb.get(),
    chnl = getChannel(channel, message.guild),
    sorted = Object.keys(users).sort((a, b) => users[b] - users[a]),
    rank = sorted.indexOf(member.id) + 1,
    score = users[member.id];
  return message.channel.send(rank == 0 ?
    `❌ ${self ? "You're" : `${member.user.tag} is`} not ranked yet${chnl && self ? `, go count some numbers first in ${chnl}` : ""}!` :
    `🔱 ${self ? "Your" : `${member.user.tag}'s`} score is ${score}, ${self ? "you" : "they"}'re #${rank} in this server!`)
    .catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
};
