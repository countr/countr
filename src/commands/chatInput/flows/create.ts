import type { ChatInputCommand } from "..";
import { flowEditor } from "../../../constants/editors/flows";

const command: ChatInputCommand = {
  description: "Create a new flow",
  considerDefaultPermission: false,
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
  execute(interaction, _, document, [, countingChannel]) {
    return flowEditor(interaction, document, countingChannel, interaction.user.id);
  },
};

export default { ...command } as ChatInputCommand;
