module.exports = {
  description: "Add a rolereward that gets rewarded by counting.",
  usage: {
    "<role>": "The role you want to use as the reward. If you want to use the role name, surround the name with \"\".",
    "<mode: each|only|score>": "If you use each, it will reward someone for every <count> count. If you use only, it will only reward someone for count <count>. If you use score, it will reward someone if their score hit <count>.",
    "<count>": "The count you want to reference in your mode.",
    "<duration: temporary|permanent>": "If you use temporary, the users will lose their role again if someone else gets rewarded with the same role. If you use permanent, they keep it forever until someone removes it."
  },
  examples: {
    "\"Count_Champ\" each 1000 temporary": "Will give users the Count Champ-role every 1000th count in the server, including 2000 and 3000 etc. And the role will last until someone else gets rewarded.",
    "469523835595653120 only 420 permanent": "Will give users the role with ID 469523835595653120 if they count the 420th count in the server. It will stay on until someone else removes it."
  },
  aliases: [ "+role", "addrolereward", "+rolereward" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 4
}

const { modes, durations, getRole, generateID } = require("../constants/index.js").rolereward;

module.exports.run = async function(client, message, args, gdb, strings) {
  let role = await getRole(args[0], message.guild);
  if (!role) return message.channel.send(`❌ ${strings.invalidRole} ${strings.commandHelp}`)

  let mode = args[1].toLowerCase();
  if (!modes.includes(mode)) return message.channel.send(`❌ ${strings.invalidMode} ${strings.commandHelp}`);

  let count = parseInt(args[2]);
  if (!count) return message.channel.send(`❌ ${strings.invalidCount} ${strings.commandHelp}`)

  let duration = args[3].toLowerCase();
  if (!durations.includes(duration)) return message.channel.send(`❌ ${strings.invalidDuration} ${strings.commandHelp}`)

  let { pins } = gdb.get(), id = generateID(Object.keys(pins));
  return gdb.setRole(id, role.id, mode, count, duration)
    .then(() => message.channel.send(`✅ ${strings.savedRole.replace(/{{ID}}/g, id)}`))
    .catch(e => console.log(e) && message.channel.send(`🆘 ${strings.databaseError}`))
}