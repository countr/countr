import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import flowList from "../../../constants/autocompletes/flowList";

const command: ChatInputCommand = {
  description: "Delete a flow",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "flow",
      description: "The flow to delete",
      required: true,
      autocomplete: true,
    },
  ],
  autocompletes: { flow: flowList },
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [, countingChannel]) {
    const flowId = interaction.options.getString("flow", true);

    // autocomplete should already show a list of flows, so this should never happen. in case it does, just ignore.
    if (!countingChannel.flows.has(flowId)) return;

    countingChannel.flows.delete(flowId);
    document.safeSave();

    return void interaction.reply({ content: `✅ Deleted flow \`${flowId}\`.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
