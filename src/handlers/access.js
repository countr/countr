const { Client, WebhookClient, Guild } = require("discord.js"), { find, findMultiple } = require("../database/access"), config = require("../../config");

const webhook = new WebhookClient({ url: config.access.webhook_log });

module.exports = async (client = new Client) => {
  setInterval(() => findMultiple(client.guilds.cache.map(guild => guild.id))
    .then(guildsWithAccess => client.guilds.cache.filter(g => !guildsWithAccess.includes(g.id)).forEach(leave))
  , config.access.interval);

  client.on("guildCreate", guild => find(guild.id).then(access => access ? null : leave(guild)));
};

function leave(guild = new Guild) {
  webhook.send({
    content: `Server **${guild.name}** (\`${guild.id}\`) owned by <@${guild.ownerId}> does not have access to use \`${guild.client.user.tag}\` and has left the server`
  });
  guild.leave();
}