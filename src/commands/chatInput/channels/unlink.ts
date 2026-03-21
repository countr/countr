import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import type { ChatInputCommand } from "..";
import countingChannels from "../../../constants/autocompletes/countingChannels";

const command: ChatInputCommand = {
  description: "Unlink a counting channel",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "channel",
      description: "The counting channel you want to unlink",
      required: true,
      autocomplete: true,
    },
  ],
  autocompletes: { channel: countingChannels },
  execute(interaction, ephemeral, document) {
    const channelId = interaction.options.getString("channel", true);

    if (!document.channels.has(channelId)) {
      return void interaction.reply({
        content: "❌ That channel is not linked to Countr.",
        flags: MessageFlags.Ephemeral,
      });
    }

    document.channels.delete(channelId);
    document.safeSave();

    return void interaction.reply({ content: `✅ The counting channel <#${channelId}> has been unlinked.`, flags: ephemeral || undefined
    });
  },
};

export default { ...command } as ChatInputCommand;
