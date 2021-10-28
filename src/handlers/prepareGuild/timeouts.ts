import { Guild } from "discord.js";
import { TimeoutRole } from "../../database/models/Guild";

export default async (guild: Guild, timeoutRole: TimeoutRole, timeouts: Map<string, Date>, save: () => void): Promise<boolean> => {
  if (!timeouts.size) return false;
  let needSave = false;

  await guild.members.fetch({ user: Array.from(timeouts.keys()) }); // fetch the members having a timeout
  for (const [ userId, timestamp ] of Array.from(timeouts)) {
    const member = guild.members.cache.get(userId);
    if (member && member.roles.cache.has(timeoutRole.roleId)) {
      if (Date.now() >= timestamp.getTime()) {
        await member.roles.remove(timeoutRole.roleId, "User no longer timed out (offline)").catch();
        timeouts.delete(userId);
        needSave = true;
      } else setTimeout(() => {
        member.roles.remove(timeoutRole.roleId, "User no longer timed out").catch();
        timeouts.delete(userId);
        save();
      }, timestamp.getTime() - Date.now());
    } else {
      timeouts.delete(userId);
      needSave = true;
    }
  }

  return needSave;
};
