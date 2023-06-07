import type { Guild } from "discord.js";
import type { CountingChannelSchema, TimeoutRoleSchema } from "../../database/models/Guild";
import { setSafeTimeout } from "../../utils/safe";

export default async (guild: Guild, timeoutRole: TimeoutRoleSchema, timeouts: CountingChannelSchema["timeouts"], safeSave: () => void): Promise<boolean> => {
  if (!timeouts.size) return false;

  let needSave = false;

  const members = await guild.members.fetch({ user: Array.from(timeouts.keys()), time: 2 ** 31 - 1 });

  const now = new Date();
  for (const [userId, date] of Array.from(timeouts)) {
    const member = members.get(userId);
    if (now >= date) {
      if (member?.roles.cache.has(timeoutRole.roleId)) await member.roles.remove(timeoutRole.roleId).catch(() => null);
      members.delete(userId);
      timeouts.delete(userId);
      needSave = true;
    } else {
      void setSafeTimeout(() => {
        if (member?.roles.cache.has(timeoutRole.roleId)) void member.roles.remove(timeoutRole.roleId).catch(() => null);
        members.delete(userId);
        timeouts.delete(userId);
        safeSave();
      }, date.getTime() - now.getTime());
    }
  }

  return needSave;
};
