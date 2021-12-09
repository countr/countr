import { SlashCommand } from "../../../../types/command";

export default {
  description: "Export all data about flows from the database",
  execute: (interaction, _, __, document, selectedCountingChannel) => {
    const scores = document.toJSON().channels[selectedCountingChannel || ""]?.scores || {};

    return interaction.reply({
      content: `✅ Here's the export from <t:${Math.floor(Date.now() / 1000)}:R> - keep this safe!`,
      files: [
        {
          name: `countr_export_guild_${interaction.guildId}_channel_${selectedCountingChannel}_scores_data.json`,
          attachment: Buffer.from(JSON.stringify(scores, null, 2)),
        },
      ],
      ephemeral: true,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
