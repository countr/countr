const { getPermissionLevel, getMember, getChannel, getRole } = require("../constants/index.js"), { deleteMessages } = require("./counting.js"), { loadCommandDescriptions } = require("../commands/help.js"), fs = require("fs"), config = require("../../config.json");

module.exports.commandHandler = async (message, gdb, db, countingChannel, prefix) => {
  let content;
  if (message.content.match(`^<@!?${message.client.user.id}> `)) content = message.content.split(" ").slice(1);
  else content = message.content.slice(prefix.length).split(" ");
  const commandOrAlias = content.shift().toLowerCase(), commandName = aliases.get(commandOrAlias) || commandOrAlias;
  content = content.join(" ");

  const static = statics.find(s => s.triggers.includes(commandName));
  if (!static && !commands.has(commandName)) { // this is not a command
    if (message.channel.id == countingChannel) return deleteMessages([ message ]);
    else return;
  }

  function processCommand() {
    if (static) return message.channel.send(static.message.replace(/{{BOT_ID}}/g, message.client.user.id));

    const commandFile = commands.get(commandName);

    if (message.channel.id == countingChannel && !commandFile.allowInCountingChannel) return message.channel.send("❌ This command is disabled inside the counting channel.");
    
    const permissionLevel = getPermissionLevel(message.member);
    if (permissionLevel < commandFile.permissionRequired) return message.channel.send("❌ You don't have permission to do this.");

    const args = (content.match(/"[^"]+"|[^ ]+/g) || []).map(arg => arg.startsWith("\"") && arg.endsWith("\"") ? arg.slice(1).slice(0, -1) : arg);
    if (!commandFile.checkArgs(args, permissionLevel)) return message.channel.send(`❌ Invalid arguments. For help, type \`${prefix}help ${commandName}\`.`);

    return commandFile.run(message, args, gdb, { prefix, permissionLevel, db, content });
  }

  const response = await processCommand();
  if (message.channel.id == countingChannel) setTimeout(() => message.channel.id == gdb.get().channel ? deleteMessages([ message, response ]) : null, 5000);
};

module.exports.setupSlashCommands = async (client, db, shardid) => {
  if (shardid == 0) registerSlashCommands(client).then(() => console.log("Manager: Slash Commands have been registered."))

  client.ws.on("INTERACTION_CREATE", async interaction => {
    console.log(JSON.stringify(interaction, null, 2))

    const
      commandFile = require(`../commands/slash/${interaction.data.name}.js`),
      gdb = await db.guild(interaction.guild_id),
      { channel: countingChannel } = gdb.get(),
      sendFunction =
        interaction.channel_id == "800684320381075457" ?
          data => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: Object.assign({ flags: 64 }, data) } }) : // hidden response
          data => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data } }); // response public to everyone
    return commandFile.run(sendFunction, getSlashArgs(interaction.data.options), { gdb, member: interaction.member, client, db })
  })
};

function getSlashArgs(options) {
  const args = {};
  for (const o in options) {
    if (o.type == 1) args[o.name] = getSlashArgs(o.options);
    else args[o.name] = o.value;
  }
  return args;
}

async function registerSlashCommands(client) {
  // remove old commands
  const registered = await client.api.applications(client.user.id).commands.get();
  await Promise.all(registered
    .filter(c => !slashCommands.get(c.name))
    .map(({ id }) => 
      client.api.applications(client.user.id).commands[id].delete()
    )
  );

  console.log(registered)

  // register commands
  await Promise.all([...slashCommands.keys()]
    .filter(name => {
      const
        c1 = slashCommands.get(name) || {},
        c2 = registered.find(s => s.name == name);
      if (
        !c2 ||
        c1.description !== c2.description ||
        JSON.stringify(c1.options || []) !== JSON.stringify(c2.options || [])
      ) return true; else return false;
    })
    .map(name => {
      const { description, options } = slashCommands.get(name);
      return client.api.applications(client.user.id).commands.post({ data: { name, description, options } });
    })
  );
}

// loading commands (not slash commands)
const commands = new Map(), aliases = new Map(), statics = require("../commands/_static.json"), slashCommands = new Map();
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) loadCommand(file.replace(".js", ""));
});
fs.readdir("./src/commands/slash/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) loadSlashCommand(file.replace(".js", ""));
})

const loadCommand = fileName => {
  const commandFile = require(`../commands/${fileName}.js`);
  if (!commandFile.premiumOnly || config.isPremium) {
    commands.set(fileName, commandFile);
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, fileName);
  }
};

const loadSlashCommand = fileName => {
  const commandFile = require(`../commands/slash/${fileName}.js`);
  if (!commandFile.premiumOnly || config.isPremium) slashCommands.set(fileName, commandFile);
};

module.exports.reloadCommand = command => {
  delete require.cache[require.resolve(`../commands/${command}.js`)];
  loadCommand(command);
  loadCommandDescriptions();
};

module.exports.reloadSlashCommand = command => {
  delete require.cache[require.resolve(`../commands/slash/${command}.js`)];
  loadSlashCommand(command);
}

module.exports.reloadStaticCommands = () => {
  delete require.cache[require.resolve("../commands/_static.json")];
  const newStatics = require("../commands/_static.json");
  statics.length = 0; // remove everything from the variable
  statics.push(...newStatics); // add new data to same variable
  loadCommandDescriptions();
};