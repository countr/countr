import type { Action } from ".";
import type { Snowflake } from "discord.js";
import properties from "../../properties";

const pruneRole: Action<[Snowflake[]]> = {
  name: "Remove everyone from a role (or list of roles)",
  description: "This will remove everyone from a role, or a list of roles.\nNote: This might not remove everyone from the role(s). This is due to caching. [Read more](todo)",
  properties: [properties.roles],
  explanation: ([roles]) => `Remove everyone from ${roles.length === 1 ? "role" : "roles"} ${roles.map(role => `<@&${role}>`).join(", ")}`,
  run: async ({ countingChannel, message: { guild }}, [roleIds]) => {
    const memberIds = Array.from(countingChannel.scores.keys());
    const members = await guild.members.fetch({ user: memberIds })
      .then(collection => Array.from(collection.values()))
      .catch(() => null) ?? [];

    for (const member of members.filter(({ roles }) => roles.cache.find(role => roleIds.includes(role.id)))) {
      await member.roles.remove(roleIds).catch(() => null);
    }
    return false;
  },
  limit: 1,
};

export default pruneRole;
