import type { Action } from ".";
import type { Snowflake } from "discord.js";
import properties from "../../properties";

const uniqueRole: Action<[Snowflake[]]> = {
  name: "Give a unique role (or list of roles) to the user",
  description: "This will add a role, or a list of roles, to the user who triggered this flow, and also remove previous users that had this role or these roles.",
  properties: [properties.roles],
  explanation: ([roles]) => `Remove previous users' roles and add the user to ${roles.length === 1 ? "role" : "roles"} ${roles.map(role => `<@&${role}>`).join(", ")}`,
  run: async ({ member, countingChannel }, [roleIds]) => {
    const roles = roleIds.filter(roleId => !member.roles.cache.has(roleId));
    if (roles.length) await member.roles.add(roles).catch(() => null);

    const previousUserIds = roleIds.map(roleId => countingChannel.metadata.get(`uniqueRole-${roleId}`) ?? null).filter((user, index, self) => user && self.indexOf(user) === index) as Snowflake[];
    if (previousUserIds.length) {
      const previousUsers = await member.guild.members.fetch({ user: previousUserIds, force: false }).catch(() => null);
      for (const roleId of roleIds) {
        const previousUserId = countingChannel.metadata.get(`uniqueRole-${roleId}`);
        if (previousUserId) {
          const previousUser = previousUsers?.find(user => user.id === previousUserId);
          if (previousUser?.roles.cache.has(roleId)) {
            void previousUser.roles.remove(roleId).catch(() => null);
          }
        }
      }
    }

    for (const roleId of roleIds) countingChannel.metadata.set(`uniqueRole-${roleId}`, member.id);
    return true;
  },
  limitPerFlow: 1,
};

export default uniqueRole;
