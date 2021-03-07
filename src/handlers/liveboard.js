const config = require("../../config.json"), { formatScore } = require("../constants/index.js");

module.exports = (client, db) => {
  return () => Promise.all(client.guilds.cache.map(async guild => {
    const
      gdb = await db.guild(guild.id),
      {
        liveboard: {
          channel: channelID,
          message: messageID
        },
        users
      } = gdb.get();
    
    if (channelID && messageID) {
      const channel = client.channels.resolve(channelID);
      if (!channel) return;

      const message = await channel.messages.fetch(messageID).catch(() => null);
      if (!message) return;

      const
        sorted = Object.keys(users).sort((a, b) => users[b] - users[a]),
        top = sorted.slice(0, 25),
        leaderboard = top.map((id, index) => formatScore(id, index, users, message.author.id)),
        description = leaderboard.join("\n");
      
      message.edit("", {
        embed: {
          author: {
            name: `${message.guild.name} Scoreboard`,
            icon_url: message.guild.iconURL({ dynamic: true, size: 128 })
          },
          description,
          color: config.color,
          timestamp: Date.now()
        }
      }).catch(() => null);
    }
  }));
};