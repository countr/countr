import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Set the channel slowmode",
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

    const channel = interaction.guild.channels.resolve(countingChannelId);
    if (!channel) return void interaction.reply({ content: "❌ The channel could not be found.", ephemeral: true });

    return void channel.edit({ rateLimitPerUser })
      .then(() => interaction.reply({ content: `✅ Counting channel <#${countingChannelId}>'s slowmode is now set to ${rateLimitPerUser} seconds.`, ephemeral }))
      .catch(() => interaction.reply({ content: `❌ Failed to set slowmode to ${rateLimitPerUser} seconds. Are you sure this is a valid amount of seconds for slowmode?`, ephemeral: true }));
  },
};

export default { ...command } as ChatInputCommand;
