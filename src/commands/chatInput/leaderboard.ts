import config from "../../config";
import createLeaderboard from "../../constants/scores";
import type { ChatInputCommand } from ".";

const command: ChatInputCommand = {
  description: "Get the top 25 users of the counting channel",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const scores = Array.from(countingChannel.scores.entries());
    if (!scores.length) return void interaction.reply({ content: `❌ There is no scoreboard to show for <#${countingChannelId}>.`, ephemeral: true });

    const serverIcon = interaction.guild.iconURL({ forceStatic: false, size: 64 });
    return void interaction.reply({
      content: `🏆 Top 25 users of <#${countingChannelId}>:`,
      embeds: [
        {
          author: {
            name: "Counting Leaderboard",
            ...serverIcon && { icon_url: serverIcon }, // eslint-disable-line camelcase
          },
          description: createLeaderboard(scores, interaction.user.id),
          color: config.colors.primary,
          timestamp: new Date().toISOString(),
        },
      ],
      ephemeral,
    });
  },
};

export default { ...command } as ChatInputCommand;
