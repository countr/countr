import type { ApplicationCommandType, Awaitable, GuildMember, Message, MessageContextMenuCommandInteraction, Snowflake, UserContextMenuCommandInteraction } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import type { PermissionLevel } from "../../constants/permissions";

type MessageMenuCommand = {
  type: ApplicationCommandType.Message;
} & (
  {
    requireSelectedCountingChannel: true;
    execute(interaction: MessageContextMenuCommandInteraction, ephemeralPreference: boolean, target: Message, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<void>;
  } | {
    requireSelectedCountingChannel?: never;
    execute(interaction: MessageContextMenuCommandInteraction, ephemeralPreference: boolean, target: Message, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake | null, countingChannel: CountingChannelSchema | null]): Awaitable<void>;
  }
);

type UserMenuCommand = {
  type: ApplicationCommandType.User;
} & (
  {
    requireSelectedCountingChannel: true;
    execute(interaction: UserContextMenuCommandInteraction, ephemeralPreference: boolean, target: GuildMember, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<void>;
  } | {
    requireSelectedCountingChannel?: never;
    execute(interaction: UserContextMenuCommandInteraction, ephemeralPreference: boolean, target: GuildMember, document: GuildDocument, selectedCountingChannel?: [countingChannelId: Snowflake | null, countingChannel: CountingChannelSchema | null]): Awaitable<void>;
  }
);

export type ContextMenuCommand = {
  permissionRequired: PermissionLevel;
  disableInCountingChannel?: true;
  premiumOnly?: true;
} & (MessageMenuCommand | UserMenuCommand);
