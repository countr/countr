const config = require("../../config.json");

module.exports = {
  embedColor: 0xBD4632,
  hexColor: "BD4632",
  getPermissionLevel: member => {
    if (config.admins[0] == member.user.id) return 5; // bot owner
    if (config.admins.includes(member.user.id)) return 4; // bot admin
    if (member.guild.ownerID == member.id) return 3; // server owner
    if (member.hasPermission("MANAGE_GUILD")) return 2; // server admin
    if (member.hasPermission("MANAGE_MESSAGES")) return 1; // server mod
    return 0; // server member
  },
  onlyUnique: (value, index, self) => self.indexOf(value) == index,
  flat: (input, depth = 1, stack = []) => {
    for (let item of input) if (item instanceof Array && depth > 0) module.exports.flat(item, depth - 1, stack); else stack.push(item);
    return stack;
  },
  parseArgs: _arguments => (_arguments.match(/\"[^"]+\"|[^ ]+/g) || []).map(argument => argument.startsWith("\"") && argument.endsWith("\"") ? argument.slice(1).slice(0, -1) : argument),
  msToTime: ms => {
    days = Math.floor(ms / 86400000); // 24*60*60*1000
    daysms = ms % 86400000; // 24*60*60*1000
    hours = Math.floor(daysms / 3600000); // 60*60*1000
    hoursms = ms % 3600000; // 60*60*1000
    minutes = Math.floor(hoursms / 60000); // 60*1000
    minutesms = ms % 60000; // 60*1000
    sec = Math.floor(minutesms / 1000);
  
    let str = "";
    if (days) str = str + days + "d";
    if (hours) str = str + hours + "h";
    if (minutes) str = str + minutes + "m";
    if (sec) str = str + sec + "s";
  
    return str;
  },
  rolereward: {
    modes: [ "each", "only", "score" ],
    durations: [ "temporary", "permanent" ]
  },
  pintrigger: {
    modes: [ "each", "only" ],
    actions: [ "keep", "repost" ]
  }
}