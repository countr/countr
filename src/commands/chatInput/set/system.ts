import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import numberSystems from "../../../constants/numberSystems";

const command: ChatInputCommand = {
  description: "Set the counting system",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "counting_system",
      description: "The counting system you want to use",
      choices: Object.entries(numberSystems).map(([value, { name }]) => ({ name, value })),
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const system = interaction.options.getString("counting_system", true) as keyof typeof numberSystems;

    countingChannel.type = system;
    document.safeSave();

    return void interaction.reply({ content: `✅ The counting system of <#${countingChannelId}> is now set to **${numberSystems[system].name}**.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
