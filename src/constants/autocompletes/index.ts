import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, Awaitable, Snowflake } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import countingChannels from "./countingChannels";
import flowList from "./flowList";

export type Autocomplete = {
  execute(query: boolean | number | string, interaction: AutocompleteInteraction<"cached">, document: GuildDocument, selectedCountingChannel: [countingChannelId: null | Snowflake, countingChannel: CountingChannelSchema | null]): Awaitable<ApplicationCommandOptionChoiceData[]>;
  requireSelectedCountingChannel?: never;
} | {
  execute(query: boolean | number | string, interaction: AutocompleteInteraction<"cached">, document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<ApplicationCommandOptionChoiceData[]>;
  requireSelectedCountingChannel: true;
};

export default { countingChannels, flowList } as const;
