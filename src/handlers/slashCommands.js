const fs = require("fs"), config = require("../../config.json");

module.exports = async (client, db, shardid) => {
  if (shardid == 0) registerCommands(client).then(() => console.log("Manager: Slash Commands have been registered."));

  client.ws.on("INTERACTION_CREATE", async interaction => {
    if (!interaction.guild_id) return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: "❌ Countr's commands only works in guilds." } } });
    const
      commandFile = require(`../commands/slash/${interaction.data.name}.js`),
      gdb = await db.guild(interaction.guild_id),
      { channel: countingChannel } = gdb.get(),
      
      sendFunction =
        interaction.channel_id == countingChannel ?
          data => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: Object.assign({ flags: 64 }, data) } }) : // hidden response
          data => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data } }); // response public to everyone
    return commandFile.run(sendFunction, { gdb, member: interaction.member, client, db, guild: interaction.guild_id }, getSlashArgs(interaction.data.options || []));
  });
};

function getSlashArgs(options) {
  const args = {};
  for (const o of options) {
    if (o.type == 1) args[o.name] = getSlashArgs(o.options || []);
    else args[o.name] = o.value;
  }
  return args;
}

async function registerCommands(client) {
  // remove old commands
  const registered = await client.api.applications(client.user.id).commands.get();
  await Promise.all(registered
    .filter(c => !commands.get(c.name))
    .map(({ id }) => 
      client.api.applications(client.user.id).commands[id].delete()
    )
  );

  // register commands
  await Promise.all([...commands.keys()]
    .filter(name => {
      const
        c1 = commands.get(name) || {},
        c2 = registered.find(s => s.name == name);
      if (
        !c2 ||
        c1.description !== c2.description ||
        JSON.stringify(c1.options || []) !== JSON.stringify(c2.options || [])
      ) return true; else return false;
    })
    .map(name => {
      const { description, options } = commands.get(name);
      return client.api.applications(client.user.id).commands.post({ data: { name, description, options } });
    })
  );
}

// loading commands
const commands = new Map();
fs.readdir("./src/commands/slash/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) loadCommand(file.replace(".js", ""));
});

const loadCommand = fileName => {
  const commandFile = require(`../commands/slash/${fileName}.js`);
  if (!commandFile.premiumOnly || config.isPremium) commands.set(fileName, commandFile);
};

module.exports.reloadCommand = command => {
  delete require.cache[require.resolve(`../commands/slash/${command}.js`)];
  loadCommand(command);
};

module.exports.registerCommands = registerCommands;
