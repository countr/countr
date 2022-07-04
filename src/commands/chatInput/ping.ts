import type { ChatInputCommand } from ".";
import { msToHumanTime } from "../../utils/time";

const command: ChatInputCommand = {
  description: "Ping the bot",
  considerDefaultPermission: true,
  async execute(interaction, ephemeral) {
    const now = Date.now();
    await interaction.deferReply({ ephemeral });
    return void interaction.editReply(`🏓 Server latency is \`${Date.now() - now}ms\`, shard latency is \`${Math.ceil(interaction.guild.shard.ping)}ms\` and my uptime is \`${msToHumanTime(interaction.client.uptime ?? 0)}\`.`);
  },
};

export default { ...command } as ChatInputCommand;
