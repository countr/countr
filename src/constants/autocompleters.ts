import type { ApplicationCommandOptionChoice, AutocompleteInteraction } from "discord.js";
import type { GuildDocument } from "../database/models/Guild";
import { matchSorter } from "match-sorter";

export type Autocomplete = (query: string | number, interaction: AutocompleteInteraction, document: GuildDocument, selectedCountingChannel?: string) => Promise<Array<ApplicationCommandOptionChoice>>;

export const flowList: Autocomplete = (query, interaction, document, selectedCountingChannel?: string) => {
  const selected = document.channels.has(interaction.channelId) ? interaction.channelId : selectedCountingChannel; // prefer current counting channel, then selected, then undefined and ask them to select
  if (!selected) return Promise.resolve([{ name: "Error: No selected counting channel. Do /select first", value: "error" }]);

  const channel = document.channels.get(selected);
  if (!channel) return Promise.resolve([]);

  const flows = Array.from(channel.flows.entries());
  const flowsFilteredAndSortedByRelevance = matchSorter(flows.map(([id, flow]) => ({ id, name: flow.name, disabled: flow.disabled })), `${query}`, { keys: ["id", "name"]});

  return Promise.resolve(flowsFilteredAndSortedByRelevance.map(({ id, name, disabled }) => ({
    name: `${name ? `${name} (${id})` : id} ${disabled ? "(disabled)" : ""}`, value: id,
  })));
};
