import type { ChatInputCommand } from "../..";

const command: ChatInputCommand = {
  description: "Export flows",
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const flows = Object.fromEntries(countingChannel.flows.entries());

    // uploading might take a while so defer first
    await interaction.deferReply({ ephemeral });

    return void interaction.editReply({
      content: `✅ Successfully exported flows of <#${countingChannelId}>.`,
      files: [{ name: `Countr Flows of guild ${interaction.guildId} channel ${interaction.channelId}.json`, attachment: Buffer.from(JSON.stringify(flows, null, 2)) }],
    });
  },
};

export default { ...command } as ChatInputCommand;
