import type { SlashCommand } from "../../../@types/command";

export default {
  description: "Remove and disable the liveboard",
  execute: (interaction, ephemeralPreference, _, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel as string);
    if (!countingChannel) return;

    delete countingChannel.liveboard;
    document.safeSave();

    return interaction.reply({
      content: `✅ The liveboard for <#${selectedCountingChannel}> is now removed.`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
  premiumOnly: true,
} as SlashCommand;
