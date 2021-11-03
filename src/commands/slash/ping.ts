import { SlashCommand } from "../../types/command";
import config from "../../config";
import { msToTime } from "../../utils/time";

export default {
  description: "Get the bot's ping",
  execute: async (interaction, ephemeral) => {
    const start = Date.now();
    await interaction.deferReply({ ephemeral });
    interaction.editReply({
      content: [`🏓 Server latency is \`${Date.now() - start}ms\`, API latency is \`${interaction.client.ws.ping}ms\` and my uptime is \`${msToTime(interaction.client.uptime || 0)}\`.`, config.statusPage ? `🔗 Having issues? Check our [status page](<${config.statusPage}>)!` : ""].filter(Boolean).join("\n"),
    });
  },
  workInPrivateMessage: true,
} as SlashCommand;
