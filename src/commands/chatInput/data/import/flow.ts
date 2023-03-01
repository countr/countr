import { ApplicationCommandOptionType, ButtonStyle, ComponentType } from "discord.js";
import superagent from "superagent";
import type { ChatInputCommand } from "../..";
import { flowEditor } from "../../../../constants/editors/flows";
import limits from "../../../../constants/limits";
import { components } from "../../../../handlers/interactions/components";
import { generateId } from "../../../../utils/crypto";
import { parseFlow } from "../../../../utils/validation/flow";

const command: ChatInputCommand = {
  description: "Import a flow configuration",
  options: [
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "flow_file",
      description: "The flow configuration to import",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    if (countingChannel.flows.size >= limits.flows.amount) return void interaction.reply({ content: `❌ You can only have up to **${limits.flows.amount}** flows.`, ephemeral: true });

    const attachment = interaction.options.getAttachment("flow_file", true);
    if (!attachment.url.endsWith(".json")) return void interaction.reply({ content: "❌ This is not a valid file type.", ephemeral: true });

    const request = superagent.get(attachment.url).then(res => res.text);

    return void Promise.all([request, interaction.deferReply({ ephemeral })]).then(([json]) => {
      const flow = parseFlow(json);
      if (!flow) return void interaction.editReply("❌ This is not a valid flow configuration.");

      const flowId = generateId();
      countingChannel.flows.set(flowId, flow);
      document.safeSave();

      void interaction.editReply({
        content: `✅ Flow configuration imported and enabled in counting channel <#${countingChannelId}>.`,
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                label: "Edit flow",
                customId: `${interaction.id}:edit-flow`,
                style: ButtonStyle.Primary,
              },
            ],
          },
        ],
      });

      components.set(`${interaction.id}:edit-flow`, {
        type: "BUTTON",
        allowedUsers: [interaction.user.id],
        callback(button) {
          return flowEditor(button, document, countingChannel, interaction.user.id, flowId);
        },
      });

      return void 0;
    });
  },
};

export default { ...command } as ChatInputCommand;
