import type { InteractionReplyOptions, InteractionUpdateOptions, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType, escapeMarkdown } from "discord.js";
import type { ChatInputCommand } from "..";
import { embedsPerMessage } from "../../../constants/discord";
import { flowEditor } from "../../../constants/editors/flows";
import actions from "../../../constants/flows/actions";
import triggers from "../../../constants/triggers";
import type { CountingChannelSchema, GuildDocument } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import { handlePlural } from "../../../utils/text";

const command: ChatInputCommand = {
  description: "List all flows",
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
  execute(interaction, _, document, countingChannelDetails) {
    return void interaction.reply(refreshList(document, countingChannelDetails, interaction.id, interaction.user.id));
  },
};

function refreshList(document: GuildDocument, [countingChannelId, countingChannel]: [Snowflake, CountingChannelSchema], uniqueIdentifier: string, userId: Snowflake, page = 0): InteractionReplyOptions & InteractionUpdateOptions {
  const flows = Array.from(countingChannel.flows.entries());

  const totalPages = Math.ceil(flows.length / embedsPerMessage);
  if (!totalPages) {
    return {
      content: `❌ No flows found for counting channel <#${countingChannelId}>.`,
      embeds: [],
      components: [],
    };
  }

  const flowsInPage = flows.slice(page * embedsPerMessage, (page + 1) * embedsPerMessage);

  const message: InteractionReplyOptions & InteractionUpdateOptions = {
    content: `📝 Showing flows **${page * embedsPerMessage + 1}-${page * embedsPerMessage + flowsInPage.length}** (${flows.length} total flows) for channel <#${countingChannelId}>`,
    embeds: flowsInPage.map(([flowId, flow]) => ({
      title: `${flow.name ? `${escapeMarkdown(flow.name)} (${flowId})` : `\`${flowId}\``} ${flow.disabled ? "(disabled)" : ""}`,
      color: parseInt(flowId, 16),
      description: `This flow contains **${handlePlural(flow.triggers.length, "trigger")}** and **${handlePlural(flow.actions.length, "action")}**.`,
    })),
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            placeholder: "Go to details of flow ...",
            minValues: 1,
            maxValues: 1,
            customId: `${uniqueIdentifier}:flow-details`,
            options: flowsInPage.map(([flowId, flow]) => ({
              label: flow.name ? `${flow.name} (${flowId})` : flowId,
              value: flowId,
            })),
          },
        ],
      },
    ],
  };

  components.set(`${uniqueIdentifier}:flow-details`, {
    type: "SELECT_MENU",
    allowedUsers: [userId],
    callback(select) {
      const [flowId] = select.values as [string];
      const flow = countingChannel.flows.get(flowId);

      // if flow no longer exists then update the list instead of showing the details
      if (!flow) return void select.update(refreshList(document, [countingChannelId, countingChannel], select.id, userId, page));

      void select.update({
        content: null,
        embeds: [
          {
            title: `${flow.name ? `${escapeMarkdown(flow.name)} (${flowId})` : `\`${flowId}\``} ${flow.disabled ? "(disabled)" : ""}`,
            color: parseInt(flowId, 16),
          },
          {
            title: "Triggers",
            color: parseInt(flowId, 16),
            fields: flow.triggers.map(({ type, data }, index) => {
              const trigger = triggers[type];
              return { name: `• ${index + 1}: ${trigger.name}`, value: trigger.explanation(data as never) };
            }),
          },
          {
            title: "Actions",
            color: parseInt(flowId, 16),
            fields: flow.actions.map(({ type, data }, index) => {
              const action = actions[type];
              return { name: `• ${index + 1}: ${action.name}`, value: action.explanation(data as never) };
            }),
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                label: "< Back",
                style: ButtonStyle.Primary,
                customId: `${select.id}:back`,
              },
              {
                type: ComponentType.Button,
                label: "Edit",
                style: ButtonStyle.Success,
                customId: `${select.id}:edit`,
              },
              {
                type: ComponentType.Button,
                label: "Delete",
                style: ButtonStyle.Danger,
                customId: `${select.id}:delete`,
              },
            ],
          },
        ],
      });

      components.set(`${select.id}:back`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(button) {
          return void button.update(refreshList(document, [countingChannelId, countingChannel], select.id, userId, page));
        },
      });

      components.set(`${select.id}:edit`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(button) {
          return flowEditor(button, document, countingChannel, button.user.id, flowId);
        },
      });

      components.set(`${select.id}:delete`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(button) {
          void button.reply({
            content: "💢 Are you sure you want to delete this flow?",
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    label: "No, cancel",
                    customId: `${button.id}:cancel`,
                    style: ButtonStyle.Secondary,
                  },
                  {
                    type: ComponentType.Button,
                    label: "Yes, I'm sure",
                    customId: `${button.id}:confirm`,
                    style: ButtonStyle.Danger,
                  },
                ],
              },
            ],
          });

          components.set(`${button.id}:confirm`, {
            type: "BUTTON",
            allowedUsers: [userId],
            callback(confirm) {
              countingChannel.flows.delete(flowId);
              document.safeSave();
              void select.editReply(refreshList(document, [countingChannelId, countingChannel], select.id, userId, page));
              return void confirm.update({
                content: `✅ Deleted flow \`${flowId}\`.`,
                components: [],
              });
            },
          });

          components.set(`${button.id}:cancel`, {
            type: "BUTTON",
            allowedUsers: [userId],
            callback(cancel) {
              return void cancel.update({
                content: "💨 Cancelled deletion.",
                components: [],
              });
            },
          });
        },
      });

      return void 0;
    },
  });

  if (totalPages > 1) {
    components.set(`${uniqueIdentifier}:prev`, {
      type: "BUTTON",
      allowedUsers: [userId],
      callback(button) {
        return void button.update(refreshList(document, [countingChannelId, countingChannel], button.id, userId, page - 1));
      },
    });

    components.set(`${uniqueIdentifier}:next`, {
      type: "BUTTON",
      allowedUsers: [userId],
      callback(button) {
        return void button.update(refreshList(document, [countingChannelId, countingChannel], button.id, userId, page + 1));
      },
    });

    message.components?.push({
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          label: "< Back",
          customId: `${uniqueIdentifier}:prev`,
          style: ButtonStyle.Primary,
          disabled: page === 0,
        },
        {
          type: ComponentType.Button,
          label: `Page ${page + 1}/${totalPages}`,
          customId: `${uniqueIdentifier}:disabled`,
          style: ButtonStyle.Secondary,
          disabled: true,
        },
        {
          type: ComponentType.Button,
          label: "Next >",
          customId: `${uniqueIdentifier}:next`,
          style: ButtonStyle.Primary,
          disabled: page === totalPages - 1,
        },
      ],
    });
  }

  return message;
}

export default { ...command } as ChatInputCommand;
