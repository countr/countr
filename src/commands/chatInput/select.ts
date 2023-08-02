import { ApplicationCommandOptionType } from "discord.js";
import countingChannels from "../../constants/autocompletes/countingChannels";
import selectedCountingChannels from "../../constants/selectedCountingChannel";
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
    if (!document.channels.has(channel)) return void interaction.reply({ content: "❌ Hmm, something went wrong here. Discord is currently having an issue with Android users not being able to use some commands. If you're on an Android device then please use the web browser or a computer to set up and interact with Countr. If you want to follow any progress on this issue then you can do so [in this GitHub issue](<https://github.com/countr/countr/issues/713>).", ephemeral: true });

    selectedCountingChannels.set(interaction.user.id, channel);
    return void interaction.reply({ content: `✅ You have selected <#${channel}> as your counting channel.`, ephemeral: true });
  },
};

export default { ...command } as ChatInputCommand;
