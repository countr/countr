module.exports = {
  description: "Dump a server's data to DMs. (GDPR-compliant)",
  usage: {},
  examples: {},
  aliases: [ "export" ],
  permissionRequired: 3, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args, permissionLevel) => {
    if (permissionLevel < 4 && args.length) return false;
    else return true;
  }
};

module.exports.run = async (message, [ id = message.guild.id ], gdb, { db }) => {
  const guilddb = await db.guild(id);

  return message.author.send(`Database information for guild ${id}`, {
    files: [
      {
        attachment: Buffer.from(JSON.stringify(guilddb.get(), null, 2)),
        name: `Countr Dump for ${id}.json`
      }
    ]
  })
    .then(m => message.channel.send(`✅ Sent to DMs! [<${m.url}>]`))
    .catch(() => message.channel.send("❌ I couldn't send you the file in DMs. Have you enabled DMs in this server?"));
};