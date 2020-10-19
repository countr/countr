const config = require("../../config.json")

// load other files
module.exports = Object.assign({}, require("./resolvers.js"), require("./time.js"))

// general information
module.exports.embedColor = 0xBD4632;
module.exports.hexColor = "BD4632";
module.exports.rolereward = {
  modes: [ "each", "only", "score" ],
  durations: [ "temporary", "permanent" ]
};
module.exports.pintrigger = {
  modes: [ "each", "only" ],
  actions: [ "keep", "repost" ]
}

// permission calculator
module.exports.getPermissionLevel = member => {
  if (config.admins[0] == member.user.id) return 5; // bot owner
  if (config.admins.includes(member.user.id)) return 4; // bot admin
  if (member.guild.ownerID == member.id) return 3; // server owner
  if (member.hasPermission("MANAGE_GUILD")) return 2; // server admin
  if (member.hasPermission("MANAGE_MESSAGES")) return 1; // server mod
  return 0; // server member
}

// filter duplicates
module.exports.onlyUnique = (value, index, self) => self.indexOf(value) == index;

// random id generator
const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
module.exports.generateID = (alreadyGenerated) => {
  let id;
  while (!id || alreadyGenerated.includes(id)) {
    id = "";
    for (let i = 0; i < 6; i++) id = id + base64[Math.floor(Math.random() * base64.length)];
  }
  return id;
}