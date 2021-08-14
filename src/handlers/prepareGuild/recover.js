const { TextChannel, Permissions } = require("discord.js");

module.exports = async (channel = new TextChannel, lastMessageId) => {
  if (channel.partial) channel = await channel.fetch();
  if (channel.lastMessageId == lastMessageId) return;
  
  let messages = await channel.messages.fetch({ limit: 100, after: lastMessageId }).catch(() => null);
  if (messages.size) try {
    const
      alert = await channel.send("💢 Making channel ready for counting."),
      defaultPermissions = channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id);
    let oldPermission = null;
    if (defaultPermissions.allow.has(Permissions.FLAGS.SEND_MESSAGES)) oldPermission = true;
    else if (defaultPermissions.deny.has(Permissions.FLAGS.SEND_MESSAGES)) oldPermission = false;

    if (oldPermission !== false) await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false
    });

    let processing = true, fail = false;
    while (processing) {
      messages = messages.filter(m => m.id !== alert.id);
      if (messages.size) {
        await channel.bulkDelete(messages).catch(() => { processing = false; fail = true; });
        messages = await channel.messages.fetch({ limit: 100, after: lastMessageId });
      } else processing = false;
    }

    if (oldPermission !== false) await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SEND_MESSAGES: getPermissionStatus(defaultPermissions, Permissions.FLAGS.SEND_MESSAGES),
      ADD_REACTIONS: getPermissionStatus(defaultPermissions, Permissions.FLAGS.ADD_REACTIONS)
    });

    if (fail) alert.edit("❌ Failed to recover the counting channel. Please re-check permissions, and if you need help, please come to our support server and we will help you out.");
    else alert.edit("🔰 The channel is ready! Happy counting!").then(m => setTimeout(m.delete, 5000));
  } catch(e) {/* something went wrong */}
  return;
};

function getPermissionStatus(permissions, node) {
  if (permissions.allow.has(node)) return true;
  if (permissions.deny.has(node)) return false;
  return null;
}