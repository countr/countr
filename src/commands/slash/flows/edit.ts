import type { SlashCommand } from "../../../@types/command";
import { flowList } from "../../../constants/autocompleters";
import walkthrough from "../../../constants/flows/walkthrough";

export default {
  description: "Edit an existing flow",
  options: [
    {
      type: "STRING",
      name: "flow",
      description: "The flow to edit",
      autocomplete: true,
      required: true,
    },
  ],
  autocompletes: {
    flow: flowList,
  },
  execute: (interaction, _, { flow }: { flow: string }, document, selectedCountingChannel) => {
    const channel = document.channels.get(selectedCountingChannel as string);

    const existingFlow = channel?.flows.get(flow);
    if (!existingFlow) {
      return interaction.reply({
        content: "❌ That flow doesn't exist.",
        ephemeral: true,
      });
    } // this should never trigger considering we're using autocomplete, but we're adding a fallback message just in case

    return walkthrough(interaction, document, selectedCountingChannel as string, existingFlow, flow);
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
