import type { PermissionResolvable, TextBasedChannelTypes } from "discord.js";

// channels
export const countingChannelAllowedChannelTypes: Array<TextBasedChannelTypes> = ["GUILD_TEXT", "GUILD_PRIVATE_THREAD", "GUILD_PUBLIC_THREAD"];

// permissions
export const countingChannelPermissions: Array<PermissionResolvable> = ["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"];
export const countingThreadParentChannelPermissions: Array<PermissionResolvable> = ["SEND_MESSAGES_IN_THREADS"];

// limits
export const embedsPerMessage = 10;
