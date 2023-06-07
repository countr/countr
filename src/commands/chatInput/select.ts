import { ApplicationCommandOptionType } from "discord.js";
import countingChannels from "../../constants/autocompletes/countingChannels";
import { selectedCountingChannels } from "../../constants/selectedCountingChannel";
import type { ChatInputCommand } from ".";

const command: ChatInputCommand = {
  description: "Select a preexisting counting channel to interact with",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "channel",
      description: "The counting channel you want to select",
      required: true,
      autocomplete: true,
    },
  ],
  autocompletes: { channel: countingChannels },
  execute(interaction, _, document) {
    const channel = interaction.options.getString("channel", true);
    if (!document.channels.has(channel)) return void interaction.reply({ content: "❌ This channel isn't a configured counting channel.", ephemeral: true });

    selectedCountingChannels.set(interaction.user.id, channel);
    return void interaction.reply({ content: `✅ You have selected <#${channel}> as your counting channel.`, ephemeral: true });
  },
};

export default { ...command } as ChatInputCommand;
