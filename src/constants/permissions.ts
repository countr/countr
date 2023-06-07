import type { PermissionResolvable } from "discord.js";
import { PermissionFlagsBits } from "discord.js";

// for non-mention commands aka. interaction commands
export enum PermissionLevel { None, Admin }

export const permissionLevels: Record<PermissionLevel, PermissionResolvable | null> = {
  [PermissionLevel.Admin]: [PermissionFlagsBits.Administrator],
  [PermissionLevel.None]: null,
};


// for mention commands
export enum DebugCommandLevel { None, Admin, Owner }
