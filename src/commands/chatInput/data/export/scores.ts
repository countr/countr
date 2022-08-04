import type { ChatInputCommand } from "../..";

const command: ChatInputCommand = {
  description: "Export scores",
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const scores = Object.fromEntries(countingChannel.scores.entries());

    // uploading might take a while so defer first
    await interaction.deferReply({ ephemeral });

    return void interaction.editReply({
      content: `✅ Successfully exported scores of <#${countingChannelId}>.`,
      files: [{ name: `Countr Scores of guild ${interaction.guildId} channel ${interaction.channelId}.json`, attachment: Buffer.from(JSON.stringify(scores, null, 2)) }],
    });
  },
};

export default { ...command } as ChatInputCommand;
