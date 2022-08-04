import type { ApplicationCommandAutocompleteOption, ApplicationCommandChannelOptionData, ApplicationCommandChoicesData, ApplicationCommandNonOptionsData, ApplicationCommandNumericOptionData, Awaitable, ChatInputCommandInteraction, Snowflake } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import type { Autocomplete } from "../../constants/autocompletes";
import { PermissionLevel } from "../../constants/permissions";

type ApplicationCommandAllowedOptions =
  | ApplicationCommandAutocompleteOption
  | ApplicationCommandChannelOptionData
  | ApplicationCommandChoicesData
  | ApplicationCommandNonOptionsData
  | ApplicationCommandNumericOptionData
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
  bypassroles: PermissionLevel.ADMIN,
  channels: PermissionLevel.ADMIN,
  data: PermissionLevel.ADMIN,
  filters: PermissionLevel.ADMIN,
  flows: PermissionLevel.ADMIN,
  liveboard: PermissionLevel.ADMIN,
  notifications: PermissionLevel.NONE,
  scores: PermissionLevel.ADMIN,
  set: PermissionLevel.ADMIN,
  timeoutrole: PermissionLevel.ADMIN,
  about: PermissionLevel.NONE,
  count: PermissionLevel.NONE,
  leaderboard: PermissionLevel.NONE,
  modules: PermissionLevel.ADMIN,
  ping: PermissionLevel.NONE,
  select: PermissionLevel.NONE,
};
