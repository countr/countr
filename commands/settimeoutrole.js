module.exports = {
  description: "Set a timeout role, so when someone counts <fail amount> times wrong within <time> seconds, they will get the role. Works best if you deny the role access to the channel.",
  usage: {
    "<role>": "The role you want the timeout role to be. If you plan on using the role name, use _ instead of spaces.",
    "<fails>": "Fails within <time> seconds to get the role.",
    "<time>": "Time in seconds users have to count <fails> times to get the role.",
    "[<duration>]": "Duration in seconds the role will stay on for. Default is forever."
  },
  examples: {
    "Timed_out 5 10": "This will give the user the role Timed out if they fail 5 times within 10 seconds.",
    "531877473437220866 3 30 120": "This will give the user the role with ID 531877473437220866 if they fail 3 times within 30 seconds, and the role will be removed after 2 minutes."
  },
  aliases: [ "=timeoutrole" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 3 || args.length == 4
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let role = [
    message.guild.roles.find(r => r.name == args[0].replace("_", "")),
    message.guild.roles.get(args[0]),
    message.guild.roles.get(args[0].replace("<&", "").replace(">", ""))
  ].find(r => r)
  if (!role) return message.channel.send("❌ Invalid role. For help, type `" + prefix + "help timeoutrole")

  let fails = parseInt(args[1])
  if (!fails) return message.channel.send("❌ Invalid fails. For help, type `" + prefix + "help timeoutrole")
  
  let time = parseInt(args[2])
  if (!time) return message.channel.send("❌ Invalid time. For help, type `" + prefix + "help timeoutrole")

  let duration = parseInt(args[3]) || null;

  gdb.set("timeoutrole", { role: role.id, fails, time, duration })
    .then(() => message.channel.send("✅ New timeout role has been saved."))
    .catch(e => console.log(e) && message.channel.send("🆘 An unknown database error occurred. Please try again, or contact support."))
}