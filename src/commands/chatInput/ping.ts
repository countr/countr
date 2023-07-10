import { msToHumanShortTime } from "../../utils/time";
import type { ChatInputCommand } from ".";

const command: ChatInputCommand = {
  description: "Ping the bot",
  async execute(interaction, ephemeral) {
    const start = Date.now();
    await interaction.client.rest.get("/gateway");
    return void interaction.reply({ content: `🏓 Gateway latency is \`${Date.now() - start}ms\`, heartbeat latency is \`${Math.ceil(interaction.guild.shard.ping)}ms\` and my uptime is \`${msToHumanShortTime(interaction.client.uptime)}\`.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
