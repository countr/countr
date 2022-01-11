import { SlashCommand } from "../../@types/command";
import config from "../../config";
import { formatScore } from "../../constants/scores";

export default {
  description: "Get the top 25 users of the counting channel",
  execute: (interaction, ephemeral, _, document, selectedCountingChannel) => {
    const scores = Array.from(document.channels.get(selectedCountingChannel as string)?.scores.entries() || []);
    if (!scores.length) {
      return interaction.reply({
        content: `❌ There are no scoreboard to show for <#${selectedCountingChannel}>.`,
        ephemeral: true,
      });
    }

    const sortedScores = scores.sort((a, b) => b[1] - a[1]);
    const top25 = sortedScores.slice(0, 25);

    const description = top25.map(([userId, score], index) => formatScore(userId, score, index, interaction.user.id)).join("\n");

    return interaction.reply({
      embeds: [
        {
          author: {
            name: "Counting Leaderboard",
            iconURL: interaction.guild?.iconURL({ dynamic: true, size: 64 }) || undefined,
          },
          description,
          color: config.colors.primary,
          timestamp: Date.now(),
        },
      ],
    });
  },
} as SlashCommand;
