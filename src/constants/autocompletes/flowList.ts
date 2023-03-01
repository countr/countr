import { matchSorter } from "match-sorter";
import type { Autocomplete } from ".";

const autocomplete: Autocomplete = {
  requireSelectedCountingChannel: true,
  execute(query, _, __, [, countingChannel]) {
    const search = String(query);

    const flows = Array.from(countingChannel.flows.entries());
    const flowsFilteredAndSortedByRelevance = matchSorter(flows.map(([id, flow]) => ({ id, name: flow.name, disabled: flow.disabled })), search, { keys: ["id", "name"] });

    return flowsFilteredAndSortedByRelevance.map(({ id, name, disabled }) => ({ name: `${name ? `${name} (${id})` : id} ${disabled ? "(disabled)" : ""}`, value: id }));
  },
};

export default { ...autocomplete } as const;
