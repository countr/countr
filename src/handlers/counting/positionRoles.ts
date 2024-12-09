import type { Snowflake } from "discord.js";
import type { CountingData } from ".";
import limits from "../../constants/limits";

export default async function handlePositionRoles({ countingChannel, document, member: { guild } }: CountingData | Pick<CountingData, "countingChannel" | "document" | "member">): Promise<void> {
  const scoresSorted = Array.from(countingChannel.scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([userId]) => userId);

  let needSave = false;

  for (const [position, roleId] of Array.from(countingChannel.positionRoles.entries())
    .map(([positionString, role]) => [Number(positionString), role] as [number, Snowflake])
    .filter(([pos]) => pos <= limits.positionRole.max)) {
    const currentRoleHaverId = countingChannel.metadata.get(`positionRole-${roleId}`);
    const newRoleHaverId = scoresSorted[position - 1];

    if (currentRoleHaverId !== newRoleHaverId) {
      const currentRoleHaver = currentRoleHaverId ? await guild.members.fetch({ user: currentRoleHaverId, force: false }).catch(() => null) : null;
      if (currentRoleHaver) void currentRoleHaver.roles.remove(roleId, "Position role removed as someone else has taken their place").catch(() => null);

      const newRoleHaver = newRoleHaverId ? await guild.members.fetch({ user: newRoleHaverId, force: false }).catch(() => null) : null;
      if (newRoleHaver) void newRoleHaver.roles.add(roleId, "Position role given").catch(() => null);

      if (newRoleHaverId) countingChannel.metadata.set(`positionRole-${roleId}`, newRoleHaverId);
      else countingChannel.metadata.delete(`positionRole-${roleId}`);

      needSave = true;
    }
  }

  if (needSave) document.safeSave();
}
