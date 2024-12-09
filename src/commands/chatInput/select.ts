import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from ".";
import countingChannels from "../../constants/autocompletes/countingChannels";
import { docsUrl } from "../../constants/links";
import selectedCountingChannels from "../../constants/selectedCountingChannel";

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
    if (channel === "no-channel-configured") return void interaction.reply({ content: `💥 No counting channel is set up in this server! Create a new one by using \`/channels new\` or link an existing one with \`/channels link\`. New to Countr? Check out the [documentation](<${docsUrl}>) to get started!`, ephemeral: true });
    if (!document.channels.has(channel)) return void interaction.reply({ content: "❌ This channel isn't a configured counting channel.", ephemeral: true });

    selectedCountingChannels.set(interaction.user.id, channel);
    return void interaction.reply({ content: `✅ You have selected <#${channel}> as your counting channel.`, ephemeral: true });
  },
};

export default { ...command } as ChatInputCommand;
