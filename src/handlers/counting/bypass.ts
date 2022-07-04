import type { CountingChannelSchema } from "../../database/models/Guild";
import type { GuildMember } from "discord.js";
import config from "../../config";

export default function checkBypass(member: GuildMember, bypassableRoles: CountingChannelSchema["bypassableRoles"]): boolean {
  if (
    member.roles.cache.find(role => bypassableRoles.includes(role.id)) ||
    config.admins.includes(member.id) ||
    config.owner === member.id
  ) return true;
  return false;
}
