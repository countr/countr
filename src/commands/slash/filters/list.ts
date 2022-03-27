import type { SlashCommand } from "..";

export default {
  description: "List all regex filters set up",
  execute: (interaction, ephemeralPreference, _, document, selectedCountingChannel) => {
    const filters = document.channels.get(selectedCountingChannel)?.filters;
    if (!filters?.length) {
      return interaction.reply({
        content: `❌ There are no regex filters set up for channel <#${selectedCountingChannel}>`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `✅ The following regex filters are set up for channel <#${selectedCountingChannel}>:\n${filters.map(f => `• \`${f}\``).join("\n")}`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
