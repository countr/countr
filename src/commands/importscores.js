module.exports = {
  description: "Import scores from a JSON-file. Upload the JSON-file with the command itself.",
  usage: {
    "set|add": "Decide if you want to overwrite the scores or add to the existing scores."
  },
  examples: {
    "set": "Will overwrite all the scores to the one in the file.",
    "add": "Will add the scores to the users' previous scores."
  },
  aliases: [],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1 && ["set", "add"].includes(args[0])
};

const fetch = require("node-fetch");

module.exports.run = async (message, [ method ], gdb, { prefix }) => {
  const file = message.attachments.first();
  if (!file) return message.channel.send(`❌ No file is attached to your command. For help, type \`${prefix}help importscores\`.`);
  if (!file.name.endsWith(".json")) return message.channel.send(`❌ Invalid file attached. For help, type \`${prefix}help importscores\`.`);
  if (file.size > 50000) return message.channel.send(`❌ File exceeds filesize limit of 50kB. For help, type \`${prefix}help importscores\`.`);

  const contents = await fetch(file.url).then(res => res.json()).catch(() => false);
  if (
    !contents ||
    typeof contents !== "object" ||
    !Object.keys(contents).length ||
    Object.keys(contents).filter(u => !parseInt(u)).length !== 0 ||
    Object.values(contents).filter(s => typeof s !== "number").length !== 0 ||
    Object.values(contents).find(s => s < 0)
  ) return message.channel.send(`❌ Invalid JSON-file attached. For help, type \`${prefix}help importscores\`.`);

  const { users } = gdb.get(), amount = Object.keys(contents).length;
  if (method == "set") Object.assign(users, contents);
  else for (const id in contents) {
    if (!users[id]) users[id] = contents[id];
    else users[id] += contents[id];
  }
  
  gdb.set("users", users);

  return message.channel.send(`✅ ${amount == 1 ? "Score of 1 user has" : `Scores of ${amount} users have`} been changed.`);
};