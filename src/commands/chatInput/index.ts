import type { ApplicationCommandAutocompleteNumericOptionData, ApplicationCommandAutocompleteStringOptionData, ApplicationCommandBooleanOptionData, ApplicationCommandChannelOptionData, ApplicationCommandMentionableOptionData, ApplicationCommandNonOptionsData, ApplicationCommandNumericOptionData, ApplicationCommandRoleOptionData, ApplicationCommandStringOptionData, ApplicationCommandUserOptionData, Awaitable, ChatInputCommandInteraction, Snowflake } from "discord.js";
import type { Autocomplete } from "../../constants/autocompletes";
import { PermissionLevel } from "../../constants/permissions";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

type ApplicationCommandAllowedOptions =
  | ApplicationCommandAutocompleteNumericOptionData
  | ApplicationCommandAutocompleteStringOptionData
  | ApplicationCommandBooleanOptionData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandMentionableOptionData
  | ApplicationCommandNonOptionsData
  | ApplicationCommandNumericOptionData
  | ApplicationCommandRoleOptionData
  | ApplicationCommandStringOptionData
  | ApplicationCommandUserOptionData
;

export type ChatInputCommand = {
  description: string;
  options?: [ApplicationCommandAllowedOptions, ...ApplicationCommandAllowedOptions[]];
  autocompletes?: Record<string, Autocomplete>;
  disableInCountingChannel?: true;
  serverCooldown?: number;
  premiumOnly?: true;
} & (
  {
    requireSelectedCountingChannel: true;
    execute(interaction: ChatInputCommandInteraction<"cached">, ephemeralPreference: boolean, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<void>;
  } | {
    requireSelectedCountingChannel?: never;
    execute(interaction: ChatInputCommandInteraction<"cached">, ephemeralPreference: boolean, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake | null, countingChannel: CountingChannelSchema | null]): Awaitable<void>;
  }
);

export const slashCommandPermissions: Record<string, PermissionLevel> = {
  bypassroles: PermissionLevel.Admin,
  channels: PermissionLevel.Admin,
  data: PermissionLevel.Admin,
  filters: PermissionLevel.Admin,
  flows: PermissionLevel.Admin,
  liveboard: PermissionLevel.Admin,
  notifications: PermissionLevel.None,
  positionroles: PermissionLevel.Admin,
  scores: PermissionLevel.Admin,
  set: PermissionLevel.Admin,
  timeoutrole: PermissionLevel.Admin,
  about: PermissionLevel.None,
  count: PermissionLevel.None,
  leaderboard: PermissionLevel.None,
  modules: PermissionLevel.Admin,
  ping: PermissionLevel.None,
  select: PermissionLevel.None,
  user: PermissionLevel.Admin,
};
