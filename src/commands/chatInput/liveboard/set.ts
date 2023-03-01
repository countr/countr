import type { TextBasedChannel } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import { textBasedChannelTypes } from "../../../constants/discord";

const command: ChatInputCommand = {
  description: "Enable the liveboard",
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "The channel to send the liveboard in",
      required: true,
      channelTypes: [...textBasedChannelTypes],
    },
  ],
  requireSelectedCountingChannel: true,
  premiumOnly: true,
  async execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const channel = interaction.options.getChannel("channel", true) as TextBasedChannel;

    const message = await channel.send("💤 The liveboard will appear in a few minutes ...").catch(() => null);
    if (!message) return void interaction.reply({ content: "❌ I was unable to send a message to that channel.", ephemeral: true });

    countingChannel.liveboard = {
      channelId: channel.id,
      messageId: message.id,
    };
    document.safeSave();

    return void interaction.reply({ content: `✅ The liveboard of <#${countingChannelId}> has been enabled. [**Go to liveboard**](${message.url})`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
