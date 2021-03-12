module.exports = {
  description: "Get your current score and rank in the server.",
  options: [
    {
      type: 6,
      name: "user",
      description: "The member you want to check the score of instead of yourself."
    }
  ]
};

module.exports.run = async (send, { gdb, member, client }, { user = member.user.id }) => {
  const { users } = gdb.get(), sorted = Object.keys(users).sort((a, b) => users[b] - users[a]), rank = sorted.indexOf(user) + 1;
  if (user == member.user.id) {
    if (rank == 0) send({ content: "❌ You're not ranked yet!" });
    else send({ content: `🔱 Your score is ${users[user]}, you're #${rank} in this server!` });
  } else {
    const u = await client.users.fetch(user, false);
    if (rank == 0) send({ content: `❌ \`${u.tag}\` is not ranked yet!` });
    else send({ content: `🔱 \`${u.tag}\`'s score is ${users[user]}, they're #${rank} in this server!` });
  }
};