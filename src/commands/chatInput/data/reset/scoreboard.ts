import { ButtonStyle, ComponentType } from "discord.js";
import type { ChatInputCommand } from "../..";
import { components } from "../../../../handlers/interactions/components";
import { databaseLogger } from "../../../../utils/logger/database";

const command: ChatInputCommand = {
  description: "Reset the guild scoreboard",
  requireSelectedCountingChannel: true,
  execute(interaction, _, document, [countingChannelId, countingChannel]) {
    void interaction.reply({
      content: `⚠ Are you sure you want to reset the scoreboard of <#${countingChannelId}>? This action cannot be undone.`,
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
      callback: button => {
        databaseLogger.verbose(`Cleared scoreboard of guild ${interaction.guildId}, contents were ${JSON.stringify(countingChannel.scores)}`);
        countingChannel.scores.clear();
        document.safeSave();
        return void button.update({
          content: `✅ Successfully reset the scoreboard of <#${countingChannelId}>.`,
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
