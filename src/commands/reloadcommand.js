const { reloadCommand, reloadStaticCommands } = require("../handlers/commands.js"), { reloadCommand: reloadSlashCommand, registerCommands } = require("../handlers/slashCommands.js"), { loadCommandDescriptions } = require("./help.js");

module.exports = {
  description: "Reload a command module.",
  usage: {
    "<type: slash|normal>": "The type of the command.",
    "<command>": "The command you'd like to reload.",
    "<shards: this|all>": "The shard(s) you'd like to reload the command for."
  },
  examples: {},
  aliases: [ "reload" ],
  permissionRequired: 5, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => ["slash", "normal"].includes(args[0]) && args[1] && ["this", "all"].includes(args[2]) && !args[3],
  allowInCountingChannel: true
};

module.exports.run = async (message, [ type, command, shards ]) => {
  if (type == "slash") {
    if (shards == "this") module.exports.reloadSlash(command);
    else message.client.shard.broadcastEval(`(()=>require("${__filename.replace(/\\/g, "\\\\")}").reloadSlash("${command}"))()`);
    registerCommands(message.client);
  } else {
    if (shards == "this") module.exports.reload(command);
    else message.client.shard.broadcastEval(`(()=>require("${__filename.replace(/\\/g, "\\\\")}").reload("${command}"))()`);
  }
  message.channel.send("✅ Command has been reloaded successfully.");
};

module.exports.reload = command => {
  if (command == "statics") reloadStaticCommands();
  else reloadCommand(command);
  loadCommandDescriptions();
};

module.exports.reloadSlash = command => reloadSlashCommand(command);