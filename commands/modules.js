module.exports = {
  description: "Manage modules you can enable or disable in your server.",
  usage: {},
  examples: {},
  aliases: [ "toggle", "module" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length || args.length == 1
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let { modules } = await gdb.get();

  if (!args[0]) return message.channel.send({ embed: {
    title: "📋 Modules",
    fields: fields.map(f => { f.name = f.name + (modules.includes(f.name) ? "✅" : "❌"); return f; }),
    color: config.color,
    footer: { text: "Requested by " + message.author.tag, icon_url: message.author.displayAvatarURL },
    timestamp: Date.now()
  }})

  let _module = args[0].toLowerCase();
  if (!modules[_module]) return message.channel.send("❌ Invalid module. For help, type `" + prefix + "help modules`")

  gdb.toggleModule(_module)
    .then(() => message.channel.send("✅ The module \`" + _module + "\` has now been " + (modules.includes(_module) ? "disabled" : "enabled") + "."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occoured. Please try again, or contact support."))
}

const modules = {
  "allow-spam": { description: "Allow people to talk multiple times in a row, instead of forcing users to wait for the next person to count first." },
  "talking": { description: "Allow people to send a text message after the count. Ex. `1 Hi there!`" },
  "recover": { description: "If the bot goes offline, this module will try and remove all unprocessed messages in the counting channel when it gets online again. It will also unlock the channel, so if you lock it temporairly - don't worry!" },
  "reposting": { description: "Repost the message being sent in a nice embed, preventing the users from editing or self-deleting their count later on.", incompatibleWith: [ "webhook" ] },
  "webhook": { description: "Same as the module `reposting` except that it will repost it in a nice embed, impersonating the user who sent it.", incompatibleWith: [ "reposting" ] }
}, fields = []

for (var moduleName in modules) fields.push({
  name: moduleName,
  value: modules[moduleName].description + (modules[moduleName].incompatibleWith ? "\n**Incompatible with:** " + modules[moduleName].incompatibleWith.map(m => "\`" + m + "\`").join(", ") : ""),
  inline: true
})