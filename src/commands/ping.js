module.exports = {
  description: "Get the latency of the bot.",
  usage: {},
  examples: {},
  aliases: [ "pong", "latency" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

const { msToTime } = require("../constants/index.js");

module.exports.run = async message => {
  const m = await message.channel.send("〽️ Pinging...");
  return m.edit(`🏓 Server latency is \`${m.createdTimestamp - message.createdTimestamp}ms\`, API latency is \`${Math.round(message.client.ws.ping)}ms\` and my uptime is \`${msToTime(message.client.uptime)}\`.`);
};