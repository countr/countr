import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "List all roles that can bypass message deletion",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
    const roles = countingChannel.bypassableRoles.map(roleId => `<@&${roleId}>`).join(", ");
    return void interaction.reply({
      content: `📊 Roles that can bypass message deletion in <#${countingChannelId}>: ${roles || "*(no roles to show as none has been configured)*"}`,
      ephemeral,
    });
  },
};

export default { ...command } as ChatInputCommand;
