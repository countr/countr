import type { SlashCommand } from "../../../@types/command";

export default {
  description: "Prune scores from users that have left your server",
  execute: async (interaction, _, __, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel as string);
    if (!countingChannel) return;

    const members = await interaction.guild?.members.fetch().then(list => list.map(member => member.id)).catch(() => null);
    if (!members) {
      return interaction.reply({
        content: "❌ I can't fetch the list of members in this server.",
        ephemeral: true,
      });
    }

    let amount = 0;
    countingChannel.scores.forEach((_, userId) => {
      if (!members.includes(userId)) {
        countingChannel.scores.delete(userId);
        amount += 1;
      }
    });
    document.safeSave();

    return interaction.reply({
      content: `✅ I have pruned ${amount}/${countingChannel.scores.size} scores from users that have left your server.`,
      ephemeral: true,
    });
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
