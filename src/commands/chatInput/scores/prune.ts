import type { ChatInputCommand } from "..";
import type { Snowflake } from "discord.js";
import { handlePositionRoles } from "../../../handlers/counting/positionRoles";

const command: ChatInputCommand = {
  description: "Prune scores from users that have left your server",
  serverCooldown: 3600,
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    await interaction.deferReply({ ephemeral });
    const members = await interaction.guild.members.fetch({ time: 2 ** 31 - 1 });

    let amount = 0;
    const total = countingChannel.scores.size;
    const backup: Record<Snowflake, number> = {};

    countingChannel.scores.forEach((_, userId) => {
      if (!members.has(userId)) {
        backup[userId] = countingChannel.scores.get(userId) ?? 0;
        countingChannel.scores.delete(userId);
        amount += 1;
      }
    });

    document.safeSave();

    void handlePositionRoles({ countingChannel, document, member: interaction.member });

    return void interaction.editReply({
      content: `✅ Successfully pruned scores of counting channel <#${countingChannelId}>: removed ${amount}/${total} users from the list. Attached is a backup of their scores, in case this was a mistake.`,
      files: [{ name: `Countr Pruned Scores of guild ${interaction.guildId} channel ${interaction.channelId}.json`, attachment: Buffer.from(JSON.stringify(backup, null, 2)) }],
    });
  },
};

export default { ...command } as ChatInputCommand;
