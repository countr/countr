import type { SlashCommand } from "../..";

export default {
  description: "Export all data from the database",
  execute: (interaction, _, __, document) => interaction.reply({
    content: `✅ Here's the export from <t:${Math.floor(Date.now() / 1000)}:R> - keep this safe!`,
    files: [
      {
        name: `countr_export_guild_${interaction.guildId}_data.json`,
        attachment: Buffer.from(JSON.stringify(document.toJSON(), null, 2)),
      },
    ],
    ephemeral: true,
  }),
} as SlashCommand;
