module.exports = async (client, db) => {
  client.on("interactionCreate", async interaction => {
    if (!interaction.guild) return;
    const
      commandFile = require(`../commands/slash/${interaction.commandName}.js`),
      gdb = await db.guild(interaction.guild.id),
      { channel: countingChannel } = gdb.get(),

      sendFunction =
        interaction.channel_id == countingChannel ?
          data => interaction.reply(Object.assign({ ephemeral: true }, data)) : // hidden response
          data => interaction.reply(data); // response public to everyone
    return commandFile.run(sendFunction, { gdb, member: interaction.member, client, db, guild: interaction.guild.id }, getSlashArgs(interaction.options.data));
  });
};

function getSlashArgs(options) {
  if (!options[0]) return {};
  if (options[0].options) return getSlashArgs(options[0].options);

  const args = {};
  for (const o of options) args[o.name] = o.value;
  return args;
}