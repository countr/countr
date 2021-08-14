const { Guild } = require("discord.js"), { guilds } = require("../../database");

module.exports = async (guild = new Guild) => {
  const db = await guilds.get(guild.id);
  
  await Promise.all(Array.from(db.channels).map(async (id, { count: { messageId }, modules, timeoutRole, timeouts }) => {
    const channel = guild.channels.cache.get(id);
    if (channel) {
      const promises = [];
      if (modules.includes("recover")) promises.push(require("./recover")(channel, messageId));
      if (timeoutRole) promises.push(require("./timeouts")(channel.guild, timeoutRole, timeouts, db.safeSave));

      return await Promise.all(promises).then(responses => responses.find(response => response) ? db.safeSave() : null); // if any of the promises return true, save the guild
    } else return;
  }));
};