import type { Action } from ".";
import type { Snowflake } from "discord.js";
import properties from "../../properties";

const takeRole: Action<[Snowflake[]]> = {
  name: "Remove a role (or list of roles) from the user",
  description: "This will remove a role, or a list of roles, from the user who triggered this flow.",
  properties: [properties.roles],
  explanation: ([roles]) => `Remove the user from ${roles.length === 1 ? "role" : "roles"} ${roles.map(role => `<@&${role}>`).join(", ")}`,
  run: async ({ member }, [roleIds]) => {
    const roles = member.roles.cache.filter(role => roleIds.includes(role.id));
    if (roles.size) await member.roles.remove(roles).catch(() => null);
    return false;
  },
  limit: 1,
};

export default takeRole;
