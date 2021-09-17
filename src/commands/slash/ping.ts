import config from "../../../config";
import { SlashCommand } from "../command";

export default {
  description: "Get the bot's ping",
  execute: async (interaction, ephemeral) => {
    const start = Date.now();
    await interaction.deferReply({ ephemeral });
    interaction.editReply({ content: [
      `🏓 Server latency is \`${Date.now() - start}ms\`, API latency is \`${interaction.client.ws.ping}\`.`,
      config.statusPage ? `🔗 Having issues? Please check our [status page](${config.statusPage}) for more information.` : ""
    ].filter(Boolean).join("\n") });
  },
  workInDms: true
} as SlashCommand;