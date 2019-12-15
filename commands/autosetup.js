module.exports = {
  description: "Quickly set up a counting channel.",
  usage: {},
  examples: {},
  aliases: [ "setup" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  try {
    let ch = await message.guild.createChannel("counting", { type: "text", rateLimitPerUser: 2 });

    gdb.set("channel", ch.id);
    gdb.set("count", 0);
    gdb.set("message", message.id);

    message.channel.send("✅ Enjoy " + ch + "!")
  } catch(e) {
    message.channel.send("❌ An unknown error occoured. Do I have permission?")
  }
}