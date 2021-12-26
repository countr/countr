import { SlashCommand } from "../../../types/command";
import { components } from "../../../handlers/interactions/components";
import { reset } from "../../../database/guilds";

export default {
  description: "Factory reset",
  execute: interaction => {
    components.set(`${interaction.id}:yes`, i => reset(i.guildId as string).then(() => i.update({
      content: "✅ Successfully reset the guild database.",
      components: [],
    })));
    components.set(`${interaction.id}:no`, i => i.update({
      content: "❌ Factory reset has been cancelled.",
      components: [],
    }));

    return interaction.reply({
      content: "⚠ Are you sure you want to reset the guild database? This will delete all data and settings. This action cannot be undone.",
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "No, go back",
              customId: `${interaction.id}:no`,
              style: "SECONDARY",
            },
            {
              type: "BUTTON",
              label: "Yes, I'm sure",
              customId: `${interaction.id}:yes`,
              style: "DANGER",
            },
          ],
        },
      ],
    });
  },
  disableInCountingChannel: true,
} as SlashCommand;
