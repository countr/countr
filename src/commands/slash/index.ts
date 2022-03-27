import type { ApplicationCommandAutocompleteOption, ApplicationCommandChannelOptionData, ApplicationCommandChoicesData, ApplicationCommandNonOptionsData, ApplicationCommandNumericOptionData, CommandInteraction, Snowflake } from "discord.js";
import type { Autocomplete } from "../../constants/autocompleters";
import type { GuildDocument } from "../../database/models/Guild";
import { PermissionLevel } from "../../constants/permissions";
import type { SlashArgRecord } from "../../handlers/interactions/commands";

export type SlashCommand = {
  description: string;
  options?: Array<(
    | ApplicationCommandChoicesData
    | ApplicationCommandNonOptionsData
    | ApplicationCommandChannelOptionData
    | ApplicationCommandAutocompleteOption
    | ApplicationCommandNumericOptionData
  )>;
  autocompletes?: Record<string, Autocomplete>;
  disableInCountingChannel?: true;
  premiumOnly?: true;
} & ({
  requireSelectedCountingChannel?: never;
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document: GuildDocument, selectedCountingChannel?: Snowflake): void;
} | {
  requireSelectedCountingChannel: true;
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document: GuildDocument, selectedCountingChannel: Snowflake): void;
})

export const permissions: Record<string, PermissionLevel> = {
  channels: PermissionLevel.ADMINISTRATOR,
  data: PermissionLevel.OWNER,
  filters: PermissionLevel.MODERATOR,
  flows: PermissionLevel.ADMINISTRATOR,
  liveboard: PermissionLevel.ADMINISTRATOR,
  module: PermissionLevel.ADMINISTRATOR,
  scores: PermissionLevel.ADMINISTRATOR,
  set: PermissionLevel.ADMINISTRATOR,
  timeoutrole: PermissionLevel.ADMINISTRATOR,
};
