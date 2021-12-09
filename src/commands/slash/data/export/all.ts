import { SlashCommand } from "../../../../types/command";

export default {
  description: "Factory reset",
  execute: (interaction, _, __, document) => interaction.reply({
    content: `✅ Here's the export as of <t:${Math.floor(Date.now() / 1000)}:R> - keep this safe!`,
    files: [
      {
        name: `countr_export_of_${interaction.guildId}.json`,
        attachment: Buffer.from(JSON.stringify(document.toJSON(), null, 2)),
      },
    ],
    ephemeral: true,
  }),
  disableInCountingChannel: true,
} as SlashCommand;
