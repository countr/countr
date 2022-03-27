import type { SlashCommand } from "..";
import { countingChannelAllowedChannelTypes } from "../../../constants/discord";

export default {
  description: "Link an existing channel to Countr",
  options: [
    {
      type: "CHANNEL",
      name: "channel",
      description: "The counting channel to unlink",
      channelTypes: countingChannelAllowedChannelTypes,
    },
    {
      type: "STRING",
      name: "from_id",
      description: "The ID of the channel to unlink. Use this if you've already deleted the channel",
    },
  ],
  // eslint-disable-next-line camelcase -- slash command options can't be camel case, we make it camel case though
  execute: (interaction, ephemeralPreference, { channel: channelId, from_id: fromId }: { channel?: string; from_id?: string; }, document) => {
    const channel = channelId || fromId;
    if (!channel) {
      return interaction.reply({
        content: "❌ You need to use one of the arguments to select the counting channel.",
        ephemeral: true,
      });
    }

    if (!document.channels.has(channel)) {
      return interaction.reply({
        content: "❌ This channel is not a linked counting channel.",
        ephemeral: true,
      });
    }

    document.channels.delete(channel);
    document.safeSave();

    return interaction.reply({
      content: `✅ Successfully unlinked counting channel <#${channel}>.`,
      ephemeral: ephemeralPreference,
    });
  },
} as SlashCommand;
