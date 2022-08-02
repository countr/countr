import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Set the increment",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "increment",
      description: "The increment to set",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const number = interaction.options.getInteger("increment", true);

    countingChannel.increment = number;
    document.safeSave();

    return void interaction.reply({ content: `✅ The increment of <#${countingChannelId}> is now set to ${number}.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
