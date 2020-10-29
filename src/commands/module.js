module.exports = {
  description: "Manage modules you can enable or disable in your server.",
  usage: {
    "[<module>]": "The module you want more information on, or turn on/off.",
    "[on|off]": "Whether you want to turn the module on or off."
  },
  examples: {
    "allow-spam on": "Toggle the module allow-spam.",
    "webhook": "Get more help on the webhook-module."
  },
  aliases: [ "modules" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => (
    !args.length ||
    args.length == 1 ||
    (
      args.length == 2 &&
      ["on", "off"].includes(args[1])
    )
  )
};

const { modules } = require("../constants/index.js"), config = require("../../config.json");

module.exports.run = async (message, [ moduleName, state ], gdb, { prefix }) => {
  if (!moduleName) {
    const { modules: enabledModules } = gdb.get();
    return message.channel.send({
      embed: {
        title: "Available modules",
        description: [
          `**Get more information with \`${prefix}module <module>\`.`,
          `Turn a module on with \`${prefix}module <module> on\`.**`,
          "",
          Object.keys(modules).map(mName => `${enabledModules.includes(mName) ? "🔘" : "⚫"} \`${mName}\` ${modules[mName].short}`).join("\n")
        ].join("\n"),
        color: config.color,
        timestamp: Date.now(),
        footer: {
          icon_url: message.author.displayAvatarURL(),
          text: `Requested by ${message.author.tag}`
        }
      }
    });
  }

  if (!modules[moduleName]) return message.channel.send("❌ No module exists with this name.");

  if (!state) return message.channel.send({
    embed: {
      title: `Module Information for module \`${moduleName}\``,
      description: modules[moduleName].long || modules[moduleName].short,
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Requested by ${message.author.tag}`
      },
      image: {
        url: modules[moduleName].image
      }
    }
  }); else {
    if (state == "on") {
      gdb.addToArray("modules", moduleName);
      return message.channel.send(`✅ Module \`${moduleName}\` has been enabled.`);
    } else {
      gdb.removeFromArray("modules", moduleName);
      return message.channel.send(`✅ Module \`${moduleName}\` has been disabled.`);
    }
  }
};