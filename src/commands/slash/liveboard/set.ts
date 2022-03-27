import type { SlashCommand } from "..";
import { countrLogger } from "../../../utils/logger/countr";
import { inspect } from "util";

export default {
  description: "Set up a liveboard in your server",
  options: [
    {
      type: "CHANNEL",
      name: "channel",
      description: "The channel to set the liveboard for",
      required: true,
    },
  ],
  execute: async (interaction, ephemeralPreference, { channel: channelId }, document, selectedCountingChannel) => {
    const channel = interaction.guild?.channels.cache.get(channelId as string);
    if (!channel?.viewable || !channel.isText()) {
      return interaction.reply({
        content: "❌ This channel is not viewable by Countr.",
        ephemeral: true,
      });
    }

    const countingChannel = document.channels.get(selectedCountingChannel);
    if (!countingChannel) return;

    const botMessage = await channel.send("💤 Loading liveboard...").catch(e => {
      countrLogger.verbose(`Error sending liveboard message to ${channelId}: ${inspect(e)}`);
      return null;
    });
    if (!botMessage) {
      return interaction.reply({
        content: `❌ Something went wrong when trying to send a message in ${channel.toString()}. Do I have permission?`,
        ephemeral: true,
      });
    }

    countingChannel.liveboard = {
      channelId: botMessage.channelId,
      messageId: botMessage.id,
    };
    document.safeSave();

    return interaction.reply({
      content: `✅ The liveboard for <#${selectedCountingChannel}> is now set to <#${channelId}> - **[Go to message](<${botMessage.url}>)**`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
  premiumOnly: true,
} as SlashCommand;
