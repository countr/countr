const { reloadCommand, reloadStaticCommands } = require("../handlers/commands.js"), { loadCommandDescriptions } = require("./help.js");

module.exports = {
  description: "Reload a command module.",
  usage: {
    "<command>": "The command you'd like to reload.",
    "<shards: this|all>": "The shard(s) you'd like to reload the command for."
  },
  examples: {},
  aliases: [ "reload" ],
  permissionRequired: 5, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args[0] && ["this", "all"].includes(args[1]) && !args[2],
  allowInCountingChannel: true
};

module.exports.run = async (message, [ command, shards ]) => {
  if (shards == "this") module.exports.reload(command);
  else message.client.shard.broadcastEval(`(()=>require("${__filename.replace(/\\/g, "\\\\")}").reload("${command}"))()`);
  message.channel.send("✅ Command has been reloaded successfully.");
};

module.exports.reload = command => {
  if (command == "statics") reloadStaticCommands();
  else reloadCommand(command);
  loadCommandDescriptions();
};