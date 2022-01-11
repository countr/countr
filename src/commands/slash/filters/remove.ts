import { SlashCommand } from "../../../@types/command";
import { regexHelpUrl } from "../../../constants/links";

export default {
  description: "Create a regex filter to disallow content from being posted in your counting channel",
  options: [
    {
      type: "STRING",
      name: "regex",
      description: `The regex to use. See ${regexHelpUrl} for help.`,
      required: true,
    },
  ],
  execute: (interaction, ephemeralPreference, { regex }, document, selectedCountingChannel) => {
    const filters = document.channels.get(selectedCountingChannel as string)?.filters || [];
    if (!filters.includes(regex as string)) {
      return interaction.reply({
        content: `❌ That regex isn't set up for channel <#${selectedCountingChannel}>.`,
        ephemeral: true,
      });
    }

    document.channels.get(selectedCountingChannel as string)?.filters.splice(filters.indexOf(regex as string), 1);
    document.safeSave();

    return interaction.reply({
      content: `✅ Removed regex \`${regex}\` from counting channel <#${selectedCountingChannel}>.`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
