import type { GuildMember, Message, MessageContextMenuInteraction, Snowflake, UserContextMenuInteraction } from "discord.js";
import type { GuildDocument } from "../../database/models/Guild";
import type { PermissionLevel } from "../../constants/permissions";

type MessageMenuCommand = {
  type: "MESSAGE";
} & ({
  requireSelectedCountingChannel?: never;
  execute(interaction: MessageContextMenuInteraction, ephemeralPreference: boolean, target: Message, document: GuildDocument, selectedCountingChannel?: Snowflake): void;
} | {
  requireSelectedCountingChannel: true;
  execute(interaction: MessageContextMenuInteraction, ephemeralPreference: boolean, target: Message, document: GuildDocument, selectedCountingChannel: Snowflake): void;
});

type UserMenuCommand = {
  type: "USER";
} & ({
  requireSelectedCountingChannel?: never;
  execute(interaction: UserContextMenuInteraction, ephemeralPreference: boolean, target: GuildMember, document: GuildDocument, selectedCountingChannel?: Snowflake): void;
} | {
  requireSelectedCountingChannel: true;
  execute(interaction: UserContextMenuInteraction, ephemeralPreference: boolean, target: GuildMember, document: GuildDocument, selectedCountingChannel: Snowflake): void;
})

export type ContextMenuCommand = (MessageMenuCommand | UserMenuCommand) & {
  disableInCountingChannel?: true;
  premiumOnly?: true;
}

export const permissions: Record<string, PermissionLevel> = {};
