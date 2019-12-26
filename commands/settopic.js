module.exports = {
  description: "Set the topic of the channel.",
  usage: {
    "<topic ...>|reset|disable": "The new topic. Use {{COUNT}} for the current count. If you put reset, it will be changed to the default. If you put disable, it will disable this functionality completely."
  },
  examples: {
    "Count to infinity! Next count is {{COUNT}}.": "An example using the placeholder."
  },
  aliases: [ "topic", "=topic" ],
  permissionRequired: 0, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let topic = args.join(" ");
  if (topic.toLowerCase() == "reset") topic = "";
  if (topic.toLowerCase() == "disable") topic = "disable";

  gdb.set("topic", topic)
    .then(() => message.channel.send("✅ The new topic has been saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}