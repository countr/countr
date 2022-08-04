import type { ChatInputCommand } from "..";
import regex from "../../../constants/properties/regex";

const command: ChatInputCommand = {
  description: "List all regex filters",
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    if (countingChannel.filters.length) {
      return void interaction.reply({
        content: `📋 Regex filters for channel <#${countingChannelId}>:\n${(
          await Promise.all(
            countingChannel.filters.map(
              async filter => `• ${await regex.format(filter, interaction.guild)}`,
            ),
          )
        ).join("\n")}`,
        ephemeral,
      });
    }

    return void interaction.reply({ content: `❌ No regex filters have been configured for counting channel <#${countingChannelId}>.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
