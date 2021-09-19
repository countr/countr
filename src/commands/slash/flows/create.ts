import { SlashCommand } from "../../command";

import walkthrough from "../../../constants/flows/walkthrough";

export default {
  description: "Create a new flow",
  execute: async interaction => walkthrough(interaction),
  disableInCountingChannel: true
} as SlashCommand;