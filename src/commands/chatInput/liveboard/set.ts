import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
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
    const channel = interaction.options.getChannel("channel", true);
    if (!channel.isSendable()) return void interaction.reply({ content: "❌ I cannot send messages to that channel.", flags: MessageFlags.Ephemeral });

    const message = await channel.send("💤 The liveboard will appear in a few minutes ...").catch(() => null);
    if (!message) return void interaction.reply({ content: "❌ I was unable to send a message to that channel.", flags: MessageFlags.Ephemeral });

    countingChannel.liveboard = {
      channelId: channel.id,
      messageId: message.id,
    };
    document.safeSave();

    return void interaction.reply({ content: `✅ The liveboard of <#${countingChannelId}> has been enabled. [**Go to liveboard**](${message.url})`, flags: ephemeral || undefined
    });
  },
};

export default { ...command } as ChatInputCommand;
