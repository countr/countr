import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Add a role that can bypass message deletion",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "The role you want to add to the list",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const role = interaction.options.getRole("role", true);
    if (countingChannel.bypassableRoles.includes(role.id)) {
      return void interaction.reply({
        content: "❌ That role is already on the list.",
        ephemeral: true,
      });
    }

    countingChannel.bypassableRoles.push(role.id);
    document.safeSave();

    return void interaction.reply({
      content: `✅ Added role ${role.toString()} to the list of roles that can bypass message deletion in <#${countingChannelId}>.`,
      ephemeral,
      allowedMentions: { roles: []},
    });
  },
};

export default { ...command } as ChatInputCommand;
