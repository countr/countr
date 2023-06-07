import numberSystems from "../../constants/numberSystems";
import type { ChatInputCommand } from ".";

const command: ChatInputCommand = {
  description: "Get the current count",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const { format } = numberSystems[countingChannel.type];
    return void interaction.reply({
      content: `📊 Current count for <#${countingChannelId}> is \`${format(countingChannel.count.number)}\`, next up is \`${format(countingChannel.count.number + countingChannel.increment)}\`.`,
      ephemeral,
    });
  },
};

export default { ...command } as ChatInputCommand;
