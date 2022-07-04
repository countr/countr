import type { ApplicationCommandAutocompleteOption, ApplicationCommandChannelOptionData, ApplicationCommandChoicesData, ApplicationCommandNonOptionsData, ApplicationCommandNumericOptionData, Awaitable, ChatInputCommandInteraction, Snowflake } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import type { Autocomplete } from "../../constants/autocompletes";

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
  considerDefaultPermission: boolean;
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
