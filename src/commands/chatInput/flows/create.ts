import type { ChatInputCommand } from "..";
import { flowEditor } from "../../../constants/editors/flows";
import limits from "../../../constants/limits";

const command: ChatInputCommand = {
  description: "Create a new flow",
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
  execute(interaction, _, document, [, countingChannel]) {
    if (Array.from(countingChannel.flows.keys()).length >= limits.flows.amount) {
      return void interaction.reply({
        content: `💢 You can only have up to **${limits.flows.amount}** flows in a counting channel.`,
        ephemeral: true,
      });
    }

    return flowEditor(interaction, document, countingChannel, interaction.user.id);
  },
};

export default { ...command } as ChatInputCommand;
