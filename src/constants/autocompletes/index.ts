import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, Awaitable, Snowflake } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import countingChannels from "./countingChannels";
import flowList from "./flowList";

export type Autocomplete = {
  requireSelectedCountingChannel: true;
  execute(query: boolean | number | string | null, interaction: AutocompleteInteraction<"cached">, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<ApplicationCommandOptionChoiceData[]>;
} | {
  requireSelectedCountingChannel?: never;
  execute(query: boolean | number | string | null, interaction: AutocompleteInteraction<"cached">, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake | null, countingChannel: CountingChannelSchema | null]): Awaitable<ApplicationCommandOptionChoiceData[]>;
};

export default { countingChannels, flowList } as const;
