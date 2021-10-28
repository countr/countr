import { GuildMember, Permissions } from "discord.js";
import config from "../config";

export type CommandPermissionLevel = "DEVELOPER" | "SUPPORT" | "OWNER" | "ADMIN" | "MOD" | "ALL";

export const ladder: Record<CommandPermissionLevel, number> = {
  "DEVELOPER": 5,
  "SUPPORT": 4,
  "OWNER": 3,
  "ADMIN": 2,
  "MOD": 1,
  "ALL": 0
};

export const getPermissionLevel = (member: GuildMember): number => {
  if (config.admins[0] == member.user.id) return 5; // bot developer
  if (config.admins.includes(member.user.id)) return 4; // bot support
  if (member.guild.ownerId == member.id) return 3; // server owner
  if (member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return 2; // server admin
  if (member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return 1; // server mod
  return 0; // server member
};
