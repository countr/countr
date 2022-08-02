import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Set the channel slowmode",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "seconds",
      description: "The amount to set the slowmode to",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId]) {
    const rateLimitPerUser = interaction.options.getInteger("seconds", true);

    return void interaction.guild.channels.resolve(countingChannelId)?.edit({ rateLimitPerUser })
      .then(() => interaction.reply({ content: `✅ Counting channel <#${countingChannelId}>'s slowmode is now set to ${rateLimitPerUser} seconds.`, ephemeral }))
      .catch(() => interaction.reply({ content: `❌ Failed to set slowmode to ${rateLimitPerUser} seconds. Are you sure this is a valid amount of seconds for slowmode?`, ephemeral }));
  },
};

export default { ...command } as ChatInputCommand;
