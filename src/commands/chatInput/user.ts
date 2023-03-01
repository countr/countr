import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from ".";

const command: ChatInputCommand = {
  description: "Get user info about yourself or someone",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "other_member",
      description: "The member you want to get info about",
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const member = interaction.options.getUser("other_member");
    const user = member ?? interaction.user;

    const score = countingChannel.scores.get(user.id) ?? 0;
    const timeout = countingChannel.timeouts.get(user.id)?.getTime() ?? 0;

    return void interaction.reply({
      content: [
        `📊 ${user.id === interaction.user.id ? "Your" : `${user.toString()}'s`} score in <#${countingChannelId}> is ${score}.`,
        timeout > Date.now() ? `\n💨 ${user.id === interaction.user.id ? "Your" : "The user's"} timeout expires <t:${Math.ceil(timeout / 1000)}:R>.` : "",
      ].filter(Boolean).join("\n"),
      ephemeral,
      allowedMentions: { users: [] },
    });
  },
};

export default { ...command } as ChatInputCommand;
