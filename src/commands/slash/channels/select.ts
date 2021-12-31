import { defaultExpirationValue, selectedCountingChannels } from "../../../constants/selectedCountingChannels";
import { SlashCommand } from "../../../@types/command";

export default {
  description: "Link an existing channel to Countr",
  options: [
    {
      type: "CHANNEL",
      name: "channel",
      description: "The channel to link",
      channelTypes: ["GUILD_TEXT", "GUILD_PRIVATE_THREAD", "GUILD_PUBLIC_THREAD"],
      required: true,
    },
  ],
  execute: (interaction, _, { channel }: { channel: string; }, document) => {
    if (document.channels.has(channel)) {
      const expires = Date.now() + defaultExpirationValue;
      selectedCountingChannels.set([interaction.guildId, interaction.user.id].join("."), { channel, expires });

      return interaction.reply({
        content: `✅ You have now selected the channel <#${channel}>. *(you will need to re-select the counting channel <t:${Math.round(expires / 1000)}:R>)*`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: "❌ That channel is not linked to Countr.",
      ephemeral: true,
    });
  },
} as SlashCommand;
