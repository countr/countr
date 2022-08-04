import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Disable the liveboard",
  requireSelectedCountingChannel: true,
  premiumOnly: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    countingChannel.liveboard = null;
    document.safeSave();

    return void interaction.reply({ content: `✅ The liveboard of <#${countingChannelId}> has been removed. (you will need to remove the leaderboard message yourself)`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
