import { MessageFlags } from "discord.js";
import type { ChatInputCommand } from ".";
import config from "../../config";
import createLeaderboard from "../../constants/scores";

const command: ChatInputCommand = {
  description: "Get the top 25 users of the counting channel",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const scores = Array.from(countingChannel.scores.entries());
    if (!scores.length) return void interaction.reply({ content: `❌ There is no scoreboard to show for <#${countingChannelId}>.`, flags: MessageFlags.Ephemeral });

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
      ...ephemeral && { flags: ephemeral },
    });
  },
};

export default { ...command } as ChatInputCommand;
