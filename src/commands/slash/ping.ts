import config from "../../../config";
import { SlashCommand } from "../../types/command";

export default {
  description: "Get the bot's ping",
  execute: async (interaction, ephemeral) => {
    const start = Date.now();
    await interaction.deferReply({ ephemeral });
    interaction.editReply({ content: [
      `🏓 Server latency is \`${Date.now() - start}ms\` and API latency is \`${interaction.client.ws.ping}ms\`.`,
      config.statusPage ? `🔗 Having issues? Check our [status page](<${config.statusPage}>)!` : ""
    ].filter(Boolean).join("\n") });
  },
  workInPrivateMessage: true
} as SlashCommand;