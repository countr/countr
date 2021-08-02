module.exports = {
  description: "Add a regex filter. (useful with the talking module)",
  usage: {
    "<regex ...>": "The regex you want to filter out of the chat. Get info on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices"
  },
  examples: {
    "duck|poop": "Will filter out all messages containing duck and/or poop.",
    "[A-Z]": "Will filter out all messages with capital letters.",
    "[A-Ca-cX-Zx-z]": "Will filter out A, B, C, X, Y, Z - regardless if it's capital or not."
  },
  aliases: [ "+regex", "addfilter", "+filter" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !!args.length,
  allowInCountingChannel: true
};

const RE2 = require("re2");

module.exports.run = async (message, _, gdb, { prefix, content: regex }) => {
  if (!testRegex(regex)) return message.channel.send(`❌ Invalid regex. For help, type \`${prefix}help addregex\`.`);

  gdb.addToArray("regex", regex);

  return message.channel.send(`✅ Regex \`${regex}\` has been added.`);
};

function testRegex(regex) {
  try {
    return new RE2(regex, "g");
  } catch(e) {
    return false;
  }
}