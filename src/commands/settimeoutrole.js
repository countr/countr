module.exports = {
  description: "Set up a timeout role.",
  usage: {
    "<role>": "The role you want the timeout role to be. If you plan on using the role name, surround it with quotation marks.",
    "<fails>": "The amount of fails within <time> seconds to get the role.",
    "<time>": "Time in seconds users have to count <fails> times to get the role.",
    "[<duration>]": "Duration in seconds the role will stay on for. Without a value, it will stay on the user forever."
  },
  examples: {
    "\"Timed out\" 5 10": "This will give the user the role Timed out if they fail 5 times within 10 seconds.",
    "@Timeout 3 30 120": "This will give the user the role Timeout if they fail 3 times within 30 seconds, and the role will be removed after 2 minutes."
  },
  aliases: [ "=timeoutrole" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3 || args.length == 4,
  allowInCountingChannel: true
};

const { getRole } = require("../constants/index.js");

module.exports.run = async (message, [ roleSearch, fails, time, duration = null ], gdb) => {
  const role = await getRole(roleSearch, message.guild);
  if (!role) return message.channel.send("❌ Invalid role.");

  fails = parseInt(fails);
  if (!fails) return message.channel.send("❌ Invalid amount of fails.");

  time = parseInt(time);
  if (!time) return message.channel.send("❌ Invalid amount of time in seconds.");

  if (duration) {
    duration = parseInt(duration);
    if (!duration) return message.channel.send("❌ Invalid duration in seconds.");
  }

  gdb.set("timeoutrole", { role: role.id, fails, time, duration });

  return message.channel.send(`✅ I will now give users the role "${role.name}" when someone fails ${fails} times within ${time} seconds${duration ? `, and I will remove it again after ${duration} seconds` : ""}.`);
};
