import { GuildMember, Permissions } from "discord.js";
import config from "../config";

export enum PermissionLevel {
  ALL,
  MODERATOR,
  ADMINISTRATOR,
  OWNER,
  BOT_SUPPORT,
  BOT_DEVELOPER,
}

export function getPermissionLevel(member: GuildMember): PermissionLevel {
  if (config.admins[0] === member.user.id) return PermissionLevel.BOT_DEVELOPER;
  if (config.admins.includes(member.user.id)) return PermissionLevel.BOT_SUPPORT;
  if (member.guild.ownerId === member.id) return PermissionLevel.OWNER;
  if (member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return PermissionLevel.ADMINISTRATOR;
  if (member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return PermissionLevel.MODERATOR;
  return PermissionLevel.ALL;
}
