import { SlashCommand } from "../../../@types/command";
import walkthrough from "../../../constants/flows/walkthrough";

export default {
  description: "Create a new flow",
  execute: (interaction, _, __, document, selectedCountingChannel) => walkthrough(interaction, document, selectedCountingChannel as string),
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
