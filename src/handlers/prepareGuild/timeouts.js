const { Guild } = require("discord.js");

module.exports = async (guild = new Guild, timeoutRole, timeouts = new Map(), save) => {
  if (!timeouts.size) return;
  let needSave = false;
  
  await guild.members.fetch({ user: Array.from(timeouts.keys()) }); // fetch the members having a timeout
  for (const [ userId, timestamp ] in Array.from(timeouts)) {
    const member = guild.members.cache.get(userId);
    if (member && member.roles.cache.has(timeoutRole.roleId)) {
      if (Date.now() >= timestamp) {
        await member.roles.remove(timeoutRole.roleId, "User no longer timed out (offline)").catch();
        timeouts.delete(userId);
        needSave = true;
      } else setTimeout(() => {
        member.roles.remove(timeoutRole.roleId, "User no longer timed out").catch();
        timeouts.delete(userId);
        save();
      }, timestamp - Date.now());
    } else {
      timeouts.delete(userId);
      needSave = true;
    }
  }

  return needSave;
};