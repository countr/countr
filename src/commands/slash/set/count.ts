import { SlashCommand } from "../../../@types/command";

export default {
  description: "Set the count",
  options: [
    {
      type: "INTEGER",
      name: "count",
      description: "The count to set",
      required: true,
    },
  ],
  execute: (interaction, ephemeralPreference, { count }, document, selectedCountingChannel) => {
    const number = count as number;
    if (number < 0) {
      return interaction.reply({
        content: "❌ Invalid count. The count must be positive.",
        ephemeral: true,
      });
    }

    const countingChannel = document.channels.get(selectedCountingChannel as string);
    if (!countingChannel) return;

    countingChannel.count = { number };
    document.safeSave();

    return interaction.reply({
      content: `✅ The count of <#${selectedCountingChannel}> is now set to ${number}.`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
