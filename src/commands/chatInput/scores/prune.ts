import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Prune scores from users that have left your server",
  considerDefaultPermission: false,
  serverCooldown: 3600,
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    await interaction.deferReply({ ephemeral });
    const members = await interaction.guild.members.fetch();

    let amount = 0;
    const total = countingChannel.scores.size;
    countingChannel.scores.forEach((_, userId) => {
      if (!members.has(userId)) {
        countingChannel.scores.delete(userId);
        amount += 1;
      }
    });
    document.safeSave();

    return void interaction.editReply(`✅ Successfully pruned scores of counting channel <#${countingChannelId}>: removed ${amount}/${total} users from the list.`);
  },
};

export default { ...command } as ChatInputCommand;
