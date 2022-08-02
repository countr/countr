import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Remove a role that can bypass message deletion",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "The role you want to remove from the list",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const role = interaction.options.getRole("role", true);
    if (!countingChannel.bypassableRoles.includes(role.id)) {
      return void interaction.reply({
        content: "❌ That role is not on the list.",
        ephemeral: true,
      });
    }

    countingChannel.bypassableRoles.splice(countingChannel.bypassableRoles.indexOf(role.id), 1);
    document.safeSave();

    return void interaction.reply({
      content: `✅ Removed role ${role.toString()} to the list of roles that can bypass message deletion in <#${countingChannelId}>.`,
      ephemeral,
      allowedMentions: { roles: []},
    });
  },
};

export default { ...command } as ChatInputCommand;
