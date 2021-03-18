module.exports = {
  description: "Prune the scoreboard for members who have left your server.",
  usage: {},
  examples: {},
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

const { msToTime } = require("../constants/index.js"), sleepTime = 2000, serversPruning = new Set();

module.exports.run = async (message, _, gdb) => {
  if (serversPruning.has(message.guild.id)) return message.channel.send("❌ This server is already pruning scores.");
  serversPruning.add(message.guild.id);

  const
    m = await message.channel.send("⏳ Loading...\n‼ We recommend locking the counting channel while this is running."),
    start = Date.now(),
    list = [];
  let
    { users } = gdb.get(),
    userIDs = Object.keys(users),
    progress = 0,
    progressInterval = setInterval(() => m.edit(`⏳ Pruning ... (${Math.round((progress / userIDs.length) * 100)}% done, ETA: ${msToTime((userIDs.length - progress) * (sleepTime + message.client.ws.ping + 50))}, found ${list.length}, processed ${progress}, remaining ${userIDs.length - progress})\n‼ We recommend locking the counting channel while this is running.`), 5000);
  for (const id of userIDs) {
    if (!(await message.guild.members.fetch({ user: id, cache: false, force: true }).catch(() => null))) list.push(id);
    await sleep(sleepTime); // avoid rate limiting
    progress++;
  }
  clearInterval(progressInterval);

  users = gdb.get().users;
  for (const id of list) delete users[id];

  gdb.set("users", users);
  serversPruning.delete(message.guild.id);

  return m.edit(`✅ Successfully pruned ${list.length} members from the scoreboard. (\`${msToTime(Date.now() - start)}\`)`);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
