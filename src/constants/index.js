const config = require("../../config.json");

// load other files, and also general information
module.exports = Object.assign({
  embedColor: 0xBD4632,
  hexColor: "BD4632"
}, require("./flows/index.js"), require("./modules.js"), require("./resolvers.js"), require("./time.js"));

// permission calculator
module.exports.getPermissionLevel = member => {
  if (config.admins[0] == member.user.id) return 5; // bot owner
  if (config.admins.includes(member.user.id)) return 4; // bot admin
  if (member.guild.ownerID == member.id) return 3; // server owner
  if (member.hasPermission("MANAGE_GUILD")) return 2; // server admin
  if (member.hasPermission("MANAGE_MESSAGES")) return 1; // server mod
  return 0; // server member
};

// filter duplicates
module.exports.onlyUnique = (value, index, self) => self.indexOf(value) == index;

// random id generator
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
module.exports.generateID = (alreadyGenerated) => {
  let id;
  while (!id || alreadyGenerated.includes(id)) {
    id = "";
    for (let i = 0; i < 6; i++) id = id + chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};