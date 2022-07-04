import { defaultExpirationValue, selectedCountingChannels } from "../../constants/selectedCountingChannel";
import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from ".";
import { countingChannelAllowedChannelTypes } from "../../constants/discord";

const command: ChatInputCommand = {
  description: "Select a counting channel to interact with",
  options: [
    {
      name: "channel",
      type: ApplicationCommandOptionType.Channel,
      description: "The channel you want to select",
      channelTypes: [...countingChannelAllowedChannelTypes],
      required: true,
    },
  ],
  considerDefaultPermission: true,
  execute(interaction, _, document) {
    const channel = interaction.options.getChannel("channel", true);
    if (!document.channels.has(channel.id)) return void interaction.reply({ content: "❌ This channel isn't a configured counting channel.", ephemeral: true });

    selectedCountingChannels.set(interaction.user.id, { channel: channel.id, expires: new Date(Date.now() + defaultExpirationValue) });
    return void interaction.reply({ content: `✅ You have selected <#${channel.id}> as your counting channel.`, ephemeral: true });
  },
};

export default { ...command } as ChatInputCommand;
