const { getPermissionLevel } = require("../constants/index.js"), { deleteMessages } = require("./counting.js"), { loadCommandDescriptions } = require("../commands/help.js"), fs = require("fs"), config = require("../../config.json");

module.exports = async (message, gdb, db, countingChannel, prefix) => {
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

module.exports.setupSlashCommands = async (client, db) => {
  client.ws.on("INTERACTION_CREATE", async interaction => {
    const commandFile = commands.get(interaciton.data.name);
    if (!commandFile) return respondWithError(interaction, `❌ The command \`${interaction.data.name}\` does not exist.`)

    const guild = client.guilds.cache.get(interaction_guild_id);
    if (!guild) return respondWithError(interaction, `❌ This guild is currently unavailable.`)
    const channel = guild.channels.cache.get(interaction.channel_id);
    if (!channel || !(commandFile.needAccessToChannel && !channel.viewable)) return respondWithError(interaction, `❌ I don't have access to view this channel.`)

    const gdb = await db.guild(guild.id), { channel: countingChannel } = gdb.get();
    if (channel.id == countingChannel && !commandFile.allowInCountingChannel) return respondWithError(interaction, "❌ This command is disabled inside the counting channel.")

    const member = guild.members.fetch(interaction.member.user.id);

    const permissionLevel = getPermissionLevel(member);
    if (permissionLevel < commandFile.permissionRequired) return respondWithError(interaction, "❌ You don't have permission to do this.")

    const args = {};
    if (interaction.data.options) for (const slashArg of interaction.data.options) {
      const { type, choices } = commandFile.options.find(o => o.name == slashArg.name);
      args[slashArg.name] = convertArg(type, slashArg.value, choices, guild);
    }

    return commandFile.run(
      {
        send: async content => {
          await client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content } } });
          return {
            edit: content => client.api.webhooks(client.user.id, interaction.token).messages('@original').patch({ data: { content } }),
            delete: () => client.api.webhooks(client.user.id, interaction.token).messages('@original').delete()
          }
        },
        followup: async content => {
          const m = await client.api.webhooks(client.user.id, interaction.token).post({ data: { content } });
          return {
            edit: content => client.api.webhooks(client.user.id, interaction.token).messages(m.id).patch({ data: { content } }),
            delete: () => client.api.webhooks(client.user.id, interaction.token).messages(m.id).delete()
          }
        },
        acknowledge: () => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 5 } }),
      },
      { client, guild, channel, member },
      args, gdb,
      { permissionLevel, db }
    )
  })
}

const respondWithError = ({ id, token }, content) => client.api.interactions(id, token).callback.post({ data: { type: 3, data: { flags: 64, content }}})

module.exports.registerSlashCommands = async client => {
  // remove old commands
  const slashCommands = await client.api.applications(client.user.id).guilds('793877712254009464').commands.get();
  await Promise.all(slashCommands
    .filter(c => !commands.get(c.name) && !statics.find(s => s.triggers[0] == c.name))
    .map(({ id }) => 
      client.api.applications(client.user.id).guilds('793877712254009464').commands[id].delete()
    )
  )

  // register commands
  await Promise.all([...commands.keys(), ...statics.map(s => s.triggers[0])]
    .filter(name => {
      const
        c1 = commands.get(name) || {},
        c2 = slashCommands.find(s => s.name == name);
      if (
        !c2 ||
        c1.description !== c2.description ||
        JSON.stringify(c1.options || []) !== JSON.stringify(c2.options || [])
      ) return true; else return false;
    })
    .map(async name => {
      const { description, options, permissionRequired } = commands.get(name) || {
        description: "Static command.",
        options: [],
        permissionRequired: 0
      };
      if (permissionRequired <= 3) return await client.api.applications(client.user.id).guilds("793877712254009464").commands.post({ data: { name, description, options } });
      else return;
    })
  )
}

function convertArg(type, arg, choices, guild) {
  let converted = arg;
  if (type == 4) converted = parseInt(arg);
  if (type == 5) converted = ["true", "yes", "y", "t", true, "false", "no", "n", "f", false].includes(typeof arg == "string" ? arg.toLowerCase() : arg) ? ["true", "yes", "y", "t", true].includes(typeof arg == "string" ? arg.toLowerCase() : arg) : null;
  if (type == 6) converted = getMember(arg, guild);
  if (type == 7) converted = getChannel(arg, guild);
  if (type == 8) converted = getRole(arg, guild);
  
  if (choices && choices.length) {
    if (choices.map(ch => ch.value).includes(converted)) return converted;
    else return null;
  } else return converted; 
}

// loading commands
const commands = new Map(), aliases = new Map(), statics = require("../commands/_static.json");
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) loadCommand(file.replace(".js", ""));
});

const loadCommand = fileName => {
  const commandFile = require(`../commands/${fileName}.js`);
  if (!commandFile.premiumOnly || config.isPremium) {
    commands.set(fileName, commandFile);
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, fileName);
  }
}

module.exports.reloadCommand = fileName => {
  delete require.cache[require.resolve(`../commands/${fileName}.js`)];
  loadCommand(fileName);
  loadCommandDescriptions();
}

module.exports.reloadStaticCommands = () => {
  delete require.cache[require.resolve("../commands/_static.json")];
  const newStatics = require("../commands/_static.json");
  statics.length = 0; // remove everything from the variable
  statics.push(...newStatics) // add new data to same variable
  loadCommandDescriptions();
}