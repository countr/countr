import { ButtonStyle, ComponentType } from "discord.js";
import type { ChatInputCommand } from "../..";
import { components } from "../../../../handlers/interactions/components";
import { resetGuildDocument } from "../../../../database";

const command: ChatInputCommand = {
  description: "Factory reset the guild",
  execute(interaction) {
    void interaction.reply({
      content: "⚠ Are you sure you want to reset the guild database? This will delete all data and settings. This action cannot be undone.",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "No, go back",
              customId: `${interaction.id}:no`,
              style: ButtonStyle.Secondary,
            },
            {
              type: ComponentType.Button,
              label: "Yes, I'm sure",
              customId: `${interaction.id}:yes`,
              style: ButtonStyle.Danger,
            },
          ],
        },
      ],
    });


    components.set(`${interaction.id}:yes`, {
      type: "BUTTON",
      allowedUsers: [interaction.user.id],
      callback: async button => {
        await resetGuildDocument(interaction.guildId);
        return void button.update({
          content: "✅ Successfully reset the guild.",
          components: [],
        });
      },
    });

    components.set(`${interaction.id}:no`, {
      type: "BUTTON",
      allowedUsers: [interaction.user.id],
      callback: button => void button.update({
        content: "❌ Reset aborted.",
        components: [],
      }),
    });

    return void 0;
  },
};

export default { ...command } as ChatInputCommand;
