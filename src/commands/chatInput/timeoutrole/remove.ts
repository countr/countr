import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Remove the timeout role",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    countingChannel.timeoutRole = null;
    document.safeSave();

    return void interaction.reply({ content: `✅ The timeout role of <#${countingChannelId}> has been removed.`, flags: ephemeral || undefined
    });
  },
};

export default { ...command } as ChatInputCommand;
// test
