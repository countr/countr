import type { Action } from ".";
import type { Snowflake } from "discord.js";
import properties from "../../properties";

const giveRole: Action<[Snowflake[]]> = {
  name: "Give a role (or list of roles) to the user",
  description: "This will add a role, or a list of roles, to the user who triggered this flow.",
  properties: [properties.roles],
  explanation: ([roles]) => `Add the user to ${roles.length === 1 ? "role" : "roles"} ${roles.map(role => `<@&${role}>`).join(", ")}`,
  run: async ({ member }, [roleIds]) => {
    const roles = member.roles.cache.filter(role => !roleIds.includes(role.id));
    if (roles.size) await member.roles.add(roles).catch(() => null);
    return false;
  },
  limit: 1,
};

export default giveRole;
