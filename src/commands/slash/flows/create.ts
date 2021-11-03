import { SlashCommand } from "../../../types/command";
import walkthrough from "../../../constants/flows/walkthrough";

export default {
  description: "Create a new flow",
  execute: (interaction, _, __, document, selectedCountingChannel) => walkthrough(interaction, document, selectedCountingChannel || "" /* always defined because requireSelectedCountingChannel is true */),
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
