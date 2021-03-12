const config = require("../../config.json");

// load other files, and also general information
module.exports = Object.assign({
  embedColor: 0xBD4632,
  hexColor: "BD4632"
}, require("./flows/index.js"), require("./modules.js"), require("./resolvers.js"), require("./time.js"), require("./tips.js"));

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

const
  medals = {
    "1st": "🥇",
    "2nd": "🥈",
    "3rd": "🥉"
  }, formatNumberSuffix = number => {
    let str = number.toString();

    if (str == "0") return "N/A";
    if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return str + "th"; // ex. eleventh instead of elevenst
    if (str.endsWith("1")) return str + "st"; // ends on first
    if (str.endsWith("2")) return str + "nd"; // ends on second
    if (str.endsWith("3")) return str + "rd"; // ends on third
    return str + "th"; // ends on fourth, fifth, sixth etc.
  };

module.exports.formatScore = (id, index, users, userid = "") => {
  let suffix = formatNumberSuffix(index + 1);
  suffix = medals[suffix] || `**${suffix}**:`;
  if (userid == id) return `${suffix} *__<@${id}>, **score:** ${(users[id] || 0).toLocaleString("en-US")}__*`;
  else return `${suffix} <@${id}>, **score:** ${(users[id] || 0).toLocaleString("en-US")}`;
};

module.exports.formatNotifications = notifications => {
  const all = [];
  for (const id in notifications) {
    const notif = notifications[id];
    let explanation;

    if (notif.mode == "each") explanation = module.exports.flow.triggers.each.explanation.replace("{0}", notif.count);
    else if (notif.mode == "only") explanation = module.exports.flow.triggers.only.explanation.replace("{0}", notif.count);

    all.push(`• \`${id}\` ${explanation}`);
  }
  return all;
};