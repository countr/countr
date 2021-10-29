import { matchSorter } from "match-sorter";
import { Autocomplete } from "../types/command";

export const flowList: Autocomplete = async (query, interaction, document, selectedCountingChannel?: string) => {
  if (!selectedCountingChannel) return [ { name: "Error: No selected counting channel. Do /select first", value: "error" }];

  const channel = document.channels.get(selectedCountingChannel);
  if (!channel) return [];

  const flows = Array.from(channel.flows.entries());
  const flowsFilteredAndSortedByRelevance = matchSorter(flows.map(([ id, flow ]) => ({ id, name: flow.name, disabled: flow.disabled })), `${query}`, { keys: [ "id", "name" ] });

  return flowsFilteredAndSortedByRelevance.map(({ id, name, disabled }) => ({
    name: (name ? `${name} (${id})` : id) + " " + (disabled ? "(disabled)" : ""), value: id
  }));
};
