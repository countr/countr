import type { Guild } from "discord.js";
import type { TimeoutRole } from "../../database/models/Guild";

export default async (guild: Guild, timeoutRole: TimeoutRole, timeouts: Map<string, Date>, save: () => void): Promise<boolean> => {
  if (!timeouts.size) return false;
  let needSave = false;

  for (const [userId, timestamp] of Array.from(timeouts)) {
    if (Date.now() >= timestamp.getTime()) {
      const member = await guild.members.fetch(userId);
      if (member && member.roles.cache.has(timeoutRole.roleId)) member.roles.remove(timeoutRole.roleId);
      timeouts.delete(userId);
      needSave = true;
    } else {
      setTimeout(async () => {
        const member = await guild.members.fetch(userId);
        if (member && member.roles.cache.has(timeoutRole.roleId)) member.roles.remove(timeoutRole.roleId);
        timeouts.delete(userId);
        save();
      }, timestamp.getTime() - Date.now());
    }
  }

  return needSave;
};
