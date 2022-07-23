import { ChannelType, OverwriteType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import type { GuildChannel, GuildMember, TextChannel, ThreadChannel } from "discord.js";


// channels
export type CountingChannelRootChannel = TextChannel;
export const countingChannelRootChannels = [ChannelType.GuildText] as const;

export type CountingChannelThreadChannel = ThreadChannel;
export const countingChannelThreadChannels = [
  ChannelType.GuildPrivateThread,
  ChannelType.GuildPublicThread,
] as const;

export type CountingChannelAllowedChannelType = CountingChannelRootChannel | CountingChannelThreadChannel;
export const countingChannelAllowedChannelTypes = [
  ...countingChannelRootChannels,
  ...countingChannelThreadChannels,
] as const;

export const textBasedChannelTypes = [
  ChannelType.GuildNews,
  ChannelType.GuildNewsThread,
  ChannelType.GuildPrivateThread,
  ChannelType.GuildPublicThread,
  ChannelType.GuildText,
  ChannelType.GuildVoice,
] as const;

// messages
export const messageFetchLimit = 100;
export const embedsPerMessage = 10;
export const messagesPerBulkDeletion = 100;
export const bulkDeleteDelay = 10000;
export const charactersPerMessage = 2000;


// permissions
export const countingChannelPermissions = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.ManageWebhooks,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ViewChannel,
] as const;

export const countingChannelRootPermissions = [
  PermissionFlagsBits.CreatePublicThreads,
  PermissionFlagsBits.ManageThreads,
  PermissionFlagsBits.SendMessagesInThreads,
] as const;

export function calculatePermissionsForChannel(channel: GuildChannel, member: GuildMember): PermissionsBitField {
  const permissions = new PermissionsBitField(member.permissions);

  for (const { allow, deny } of Array.from(channel.permissionOverwrites.cache.values())
    .filter(({ type, id }) => type === OverwriteType.Role ? member.roles.cache.has(id) : id === member.id)
    .sort((a, b) => {
      if (a.type === b.type && a.type === OverwriteType.Role) return member.roles.resolve(a.id)!.comparePositionTo(member.roles.resolve(b.id)!);
      return a.type - b.type;
    })
  ) {
    permissions.add(allow);
    permissions.remove(deny);
  }

  return permissions;
}


// regex
export const snowflakeRegex = /^\d{17,19}$/u;
