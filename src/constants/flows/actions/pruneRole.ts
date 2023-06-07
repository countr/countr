import type { Snowflake } from "discord.js";
import properties from "../../properties";
import type { Action } from ".";

const pruneRole: Action<[Snowflake[]]> = {
  name: "Remove everyone from a role (or list of roles) [DEPRECATED]",
  description: "Use the new action called \"unique role\" to achieve the same effect.",
  properties: [properties.roles],
  explanation: ([roles]) => `~~Remove everyone from ${roles.length === 1 ? "role" : "roles"} ${roles.map(role => `<@&${role}>`).join(", ")}~~`,
  run: async ({ countingChannel, message: { guild } }, [roleIds]) => {
    const memberIds = Array.from(countingChannel.scores.keys());
    const members = await guild.members.fetch({ user: memberIds, time: 2 ** 31 - 1 })
      .then(collection => Array.from(collection.values()))
      .catch(() => null) ?? [];

    for (const member of members.filter(({ roles }) => roles.cache.find(role => roleIds.includes(role.id)))) {
      await member.roles.remove(roleIds).catch(() => null);
    }
    return false;
  },
  limitPerFlow: 1,
};

export default pruneRole;
