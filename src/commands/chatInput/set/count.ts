import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import numberSystems from "../../../constants/numberSystems";

const command: ChatInputCommand = {
  description: "Set the count",
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

    return void interaction.reply({ content: `✅ The count of <#${countingChannelId}> is now set to ${number}. ${countingChannel.type === "decimal" ? "" : `(${countingChannel.type}: \`${numberSystems[countingChannel.type].format(number)}\`)`}`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
