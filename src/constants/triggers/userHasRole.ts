import type { Snowflake } from "discord.js";
import type { Trigger } from ".";
import properties from "../properties";

const userHasRole: Trigger<[Snowflake[]]> = {
  name: "User has role",
  description: "This will get triggered when the user who is counting has any of the specified roles.",
  properties: [properties.roles],
  supports: ["flows", "notifications"],
  explanation: ([roleIds]) => `When someone with ${roleIds.length === 1 ? "the role" : "any of the roles"} ${roleIds.map(roleId => `<@&${roleId}>`).join(", ")} counts`,
  check: ({ member }, [roleIds]) => member.roles.cache.some(role => roleIds.includes(role.id)),
};

export default userHasRole;