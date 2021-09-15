import { TextChannel, ThreadChannel, Permissions, PermissionOverwrites, PermissionResolvable } from "discord.js";

export default async (channel: TextChannel | ThreadChannel, lastMessageId: string): Promise<boolean> => {
  if (channel.partial) await channel.fetch();
  let messages = await channel.messages.fetch({ limit: 100, after: lastMessageId }).catch(() => null);
  if (messages.size) try {
    const alert = await channel.send("💢 Making channel ready for counting.");

    let oldPermission: boolean = null, defaultPermissions: PermissionOverwrites = null;
    if (channel instanceof TextChannel) {
      defaultPermissions = channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id);
      oldPermission = getPermissionStatus(defaultPermissions, Permissions.FLAGS.SEND_MESSAGES);

      if (oldPermission !== false) await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SEND_MESSAGES: false,
        ADD_REACTIONS: false
      });
    }

    let processing = true, fail = false;
    while (processing) {
      messages = messages.filter(m => m.id !== alert.id);
      if (messages.size) {
        await channel.bulkDelete(messages).catch(() => { processing = false; fail = true; });
        messages = await channel.messages.fetch({ limit: 100, after: lastMessageId });
      } else processing = false;
    }

    if (channel instanceof TextChannel && oldPermission !== false) await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SEND_MESSAGES: getPermissionStatus(defaultPermissions, Permissions.FLAGS.SEND_MESSAGES),
      ADD_REACTIONS: getPermissionStatus(defaultPermissions, Permissions.FLAGS.ADD_REACTIONS)
    });

    if (fail) alert.edit("❌ Failed to recover the counting channel. Please re-check permissions, and if you need help, please come to our support server and we will help you out.");
    else alert.edit("🔰 The channel is ready! Happy counting!").then(m => setTimeout(m.delete, 5000));
  } catch(e) {/* something went wrong */}
  return true;
};

function getPermissionStatus(permissions: PermissionOverwrites, permission: PermissionResolvable): boolean | null {
  if (permissions.allow.has(permission)) return true;
  if (permissions.deny.has(permission)) return false;
  return null;
}