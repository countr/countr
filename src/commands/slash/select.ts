import { defaultExpirationValue, selectedCountingChannels } from "../../constants/selectedCountingChannels";
import { SlashCommand } from "../../@types/command";

export default {
  description: "Select a counting channel to edit",
  options: [
    {
      type: "CHANNEL",
      name: "channel",
      description: "The channel to select",
      channelTypes: ["GUILD_TEXT", "GUILD_PRIVATE_THREAD", "GUILD_PUBLIC_THREAD"],
      required: true,
    },
  ],
  execute: (interaction, _, { channel }: { channel: string; }, document) => {
    if (!document.channels.has(channel)) {
      return interaction.reply({
        content: "❌ That channel isn't linked to Countr.",
        ephemeral: true,
      });
    }

    const expires = Date.now() + defaultExpirationValue;
    selectedCountingChannels.set([interaction.guildId, interaction.user.id].join("."), { channel, expires });

    interaction.reply({
      content: `✅ Selected counting channel <#${channel}> (selection expires <t:${Math.round(expires / 1000)}:R>)`,
      ephemeral: true,
    });
  },
} as SlashCommand;
