import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "../..";
import flowList from "../../../../constants/autocompletes/flowList";

const command: ChatInputCommand = {
  description: "Export a flow",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "flow",
      description: "The flow you want to export",
      required: true,
      autocomplete: true,
    },
  ],
  autocompletes: { flow: flowList },
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const flowId = interaction.options.getString("flow", true);

    const flow = countingChannel.flows.get(flowId);
    if (!flow) return void interaction.reply({ content: "❌ Flow not found.", ephemeral: true });

    // uploading might take a while so defer first
    await interaction.deferReply({ ephemeral });

    return void interaction.editReply({
      content: `✅ Here's the export of flow \`${flowId}\` from counting channel <#${countingChannelId}>.`,
      files: [{ name: `Countr Flow ${flowId} of guild ${interaction.guildId} channel ${interaction.channelId}.json`, attachment: Buffer.from(JSON.stringify(flow, null, 2)) }],
    });
  },
};

export default { ...command } as ChatInputCommand;
