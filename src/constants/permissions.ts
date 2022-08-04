import { PermissionFlagsBits } from "discord.js";
import type { PermissionResolvable } from "discord.js";

// for non-mention commands aka. interaction commands
export enum PermissionLevel { NONE, ADMIN }

export const permissionLevels: Record<PermissionLevel, PermissionResolvable | null> = {
  [PermissionLevel.ADMIN]: [PermissionFlagsBits.Administrator],
  [PermissionLevel.NONE]: null,
};


// for mention commands
export enum DebugCommandLevel { NONE, ADMIN, OWNER }
