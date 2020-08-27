const { getPermissionLevel } = require("../constants/index.js"), getTranslations = require("./translations.js");

// loading commands
const commands = new Map(), aliases = new Map(), shorts = new Map();
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) {
    const commandFile = require(`../commands/${file}`), fileName = file.replace(".js", "");
    commands.set(fileName, commandFile);
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, fileName);
  }
})
for (const short of require("../commands/_.json")) short.triggers.forEach(trigger => shorts.set(trigger, short.message))

module.exports = async (message, prefix, gdb, db) => {
  let content;
  if (message.content.match(`^<@!?${client.user.id}> `)) content = message.content.split(" ").slice(1);
  else content = message.content.slice(prefix.length).split(" ")
  const commandOrAlias = content.shift().toLowerCase(), commandName = aliases.get(commandOrAlias) || commandOrAlias;
  content = content.join(" ");

  const short = shorts.get(commandName);
  if (short) return message.channel.send(short);

  const commandFile = commands.get(commandName);
  if (!commandFile) return;
  
  if (message.partial && !message.member) message = await message.fetch();
  if (message.member.partial) message.member = await message.member.fetch(); 

  const permissionLevel = getPermissionLevel(message.member), strings = getTranslations(gdb, commandName, commandOrAlias, Object.keys(commandFile.usage).join(" "));

  if (permissionLevel < commandFile.permissionLevel) return message.channel.send(`❌ ${strings.noPermission}`)

  const args = (content.match(/\"[^"]+\"|[^ ]+/g) || []).map(arg => arg.startsWith("\"") && arg.endsWith("\"") ? arg.slice(1).slice(0, -1) : arg);
  if (!commandFile.checkArgs(args, permissionLevel)) return message.channel.send(`❌ ${strings.invalidArguments}`)

  commandFile.run(message, args, gdb, { prefix, permissionLevel, db, content })
}