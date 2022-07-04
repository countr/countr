import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Set the count",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "count",
      description: "The count to set",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const number = interaction.options.getInteger("count", true);

    countingChannel.count = { number };
    document.safeSave();

    return void interaction.reply({ content: `✅ The count of <#${countingChannelId}> is now set to ${number}.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
