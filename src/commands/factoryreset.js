module.exports = {
  description: "Reset all data Countr has stored about this server.",
  usage: {},
  examples: {},
  aliases: [],
  permissionRequired: 3, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
};

module.exports.run = async (message, _, gdb) => {
  const confirmation = await new Promise(resolve => {
    message.channel.send("⚠️ Are you sure you want to delete all data Countr stores from this server? You will not be able to recover anything of it if you do this!\nType `yes` or `no` in chat.");
    message.channel.awaitMessages(m => m.author.id == message.author.id && ["yes", "no"].includes(m.content.toLowerCase()), { max: 1, time: 30000, errors: [ "time" ]})
      .then(collection => collection.first().content == "yes" ? resolve(true) : resolve(false))
      .catch(() => resolve(false));
  });
  if (!confirmation) return message.channel.send("✴️ Factory reset canceled.");

  gdb.reset();
  
  return message.channel.send("☠️ All data is now reset to the default. Keep in mind the prefix is also reset.");
};