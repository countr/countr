const { msToTime } = require("../../constants/index.js");

module.exports = {
  description: "See how long until you (or someone else) lose the timeout role.",
  options: [
    {
      type: 6,
      name: "user",
      description: "The member you want to check instead of yourself."
    }
  ]
};

module.exports.run = async (send, { gdb, member, client }, { user = member.user.id }) => {
  const { timeouts } = gdb.get(), timeout = timeouts[user];
  if (user == member.user.id) {
    if (!timeout || timeout < Date.now()) send({ content: "💨 You're not being timed out!" });
    else send({ content: `💤 You have \`${msToTime(timeout - Date.now())}\` time left.` });
  } else {
    const u = await client.users.fetch(user, false);
    if (!timeout || timeout < Date.now()) send({ content: `💨 \`${u.tag}\` is not being timed out!` });
    else send({ content: `💤 \`${u.tag}\` has \`${msToTime(timeout - Date.now())}\` time left.` });
  }
};