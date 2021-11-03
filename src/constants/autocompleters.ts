import { Autocomplete } from "../types/command";
import { matchSorter } from "match-sorter";

export const flowList: Autocomplete = (query, interaction, document, selectedCountingChannel?: string) => {
  if (!selectedCountingChannel) return Promise.resolve([{ name: "Error: No selected counting channel. Do /select first", value: "error" }]);

  const channel = document.channels.get(selectedCountingChannel);
  if (!channel) return Promise.resolve([]);

  const flows = Array.from(channel.flows.entries());
  const flowsFilteredAndSortedByRelevance = matchSorter(flows.map(([id, flow]) => ({ id, name: flow.name, disabled: flow.disabled })), `${query}`, { keys: ["id", "name"]});

  return Promise.resolve(flowsFilteredAndSortedByRelevance.map(({ id, name, disabled }) => ({
    name: `${name ? `${name} (${id})` : id} ${disabled ? "(disabled)" : ""}`, value: id,
  })));
};
