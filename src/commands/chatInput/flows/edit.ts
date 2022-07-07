import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import { flowEditor } from "../../../constants/editors/flows";
import flowList from "../../../constants/autocompletes/flowList";

const command: ChatInputCommand = {
  description: "Edit a flow",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "flow",
      description: "The flow to edit",
      required: true,
      autocomplete: true,
    },
  ],
  autocompletes: { flow: flowList },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
  execute(interaction, _, document, [, countingChannel]) {
    const flowId = interaction.options.getString("flow", true);

    // autocomplete should already show a list of flows, so this should never happen. in case it does, just ignore.
    if (!countingChannel.flows.has(flowId)) return;

    return flowEditor(interaction, document, countingChannel, interaction.user.id, flowId);
  },
};

export default { ...command } as ChatInputCommand;
