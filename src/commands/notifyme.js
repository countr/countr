module.exports = {
  description: "Get a notification whenever the server reach whatever count you want.",
  usage: {
    "[each]": "If you include this, it will notify you of a multiplication of <count>.",
    "<count>": "The count you want to get notified of."
  },
  examples: {
    "each 1000": "Get notified for every 1000th count, including 2000 and 3000 and so on.",
    "420": "Get notified whenever the server reach count 420."
  },
  aliases: [ "alertme", "notify", "alert" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1 || (args.length == 2 && args[0] == "each"),
  allowInCountingChannel: true
};

const { generateID } = require("../constants/index.js");

module.exports.run = async (message, [ mode, count ], gdb) => {
  if (!count) {
    count = parseInt(mode);
    mode = "only";
  } else count = parseInt(count);
  if (!count) return message.channel.send("❌ Invalid count.");

  const { notifications } = gdb.get(), id = generateID(Object.keys(notifications));

  gdb.setOnObject("notifications", id, {
    user: message.author.id, mode, count
  });

  message.channel.send(`✅ Notification with ID \`${id}\` has been saved!`);
};