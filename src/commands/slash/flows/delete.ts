import { SlashCommand } from "../../../@types/command";
import { flowList } from "../../../constants/autocompleters";

export default {
  description: "Delete a flow",
  options: [
    {
      type: "STRING",
      name: "flow",
      description: "The flow to delete",
      autocomplete: true,
      required: true,
    },
  ],
  autocompletes: {
    flow: flowList,
  },
  execute: (interaction, ephemeralPreference, { flow }: { flow: string }, document, selectedCountingChannel) => {
    const channel = document.channels.get(selectedCountingChannel as string);

    if (!channel?.flows.has(flow)) {
      return interaction.reply({
        content: "❌ That flow doesn't exist.",
        ephemeral: true,
      });
    } // this should never trigger considering we're using autocomplete, but we're adding a fallback message just in case

    channel.flows.delete(flow);
    document.safeSave();

    return interaction.reply({
      content: `✅ Deleted flow \`${flow}\`.`, ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
