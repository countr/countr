import type { ApplicationCommandType, Awaitable, GuildMember, Message, MessageContextMenuCommandInteraction, MessageFlags, Snowflake, UserContextMenuCommandInteraction } from "discord.js";
import type { PermissionLevel } from "../../constants/permissions";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

type MessageMenuCommand = (
  {
    execute(interaction: MessageContextMenuCommandInteraction, ephemeralPreference: 0 | MessageFlags.Ephemeral, target: Message, document: GuildDocument, selectedCountingChannel: [countingChannelId: null | Snowflake, countingChannel: CountingChannelSchema | null]): Awaitable<void>;
    requireSelectedCountingChannel?: never;
  } | {
    execute(interaction: MessageContextMenuCommandInteraction, ephemeralPreference: 0 | MessageFlags.Ephemeral, target: Message, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<void>;
    requireSelectedCountingChannel: true;
  }
) & {
  type: ApplicationCommandType.Message;
};

type UserMenuCommand = (
  {
    execute(interaction: UserContextMenuCommandInteraction, ephemeralPreference: 0 | MessageFlags.Ephemeral, target: GuildMember, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<void>;
    requireSelectedCountingChannel: true;
  } | {
    execute(interaction: UserContextMenuCommandInteraction, ephemeralPreference: 0 | MessageFlags.Ephemeral, target: GuildMember, document: GuildDocument, selectedCountingChannel?: [countingChannelId: null | Snowflake, countingChannel: CountingChannelSchema | null]): Awaitable<void>;
    requireSelectedCountingChannel?: never;
  }
) & {
  type: ApplicationCommandType.User;
};

export type ContextMenuCommand = {
  disableInCountingChannel?: true;
  permissionRequired: PermissionLevel;
  premiumOnly?: true;
} & (MessageMenuCommand | UserMenuCommand);
