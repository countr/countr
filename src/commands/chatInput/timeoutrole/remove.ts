import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Remove the timeout role",
  considerDefaultPermission: false,
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    delete countingChannel.timeoutRole;
    document.safeSave();

    return void interaction.reply({ content: `✅ The timeout role of <#${countingChannelId}> has been removed.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
