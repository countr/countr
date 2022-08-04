import { ButtonStyle, ComponentType } from "discord.js";
import type { ChatInputCommandInteraction, InteractionReplyOptions, InteractionUpdateOptions, Snowflake } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../../database/models/Guild";
import type { ChatInputCommand } from "..";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";
import limits from "../../../constants/limits";
import triggers from "../../../constants/triggers";

const command: ChatInputCommand = {
  description: "List all your notifications",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, countingChannelDetails) {
    return void interaction.reply({ ...refreshList(interaction, ephemeral, document, countingChannelDetails, interaction.id), ephemeral });
  },
};

function refreshList(interaction: ChatInputCommandInteraction<"cached">, ephemeral: boolean, document: GuildDocument, [countingChannelId, countingChannel]: [Snowflake, CountingChannelSchema], uniqueIdentifier: string): InteractionReplyOptions & InteractionUpdateOptions {
  const allNotifications = Array.from(countingChannel.notifications.entries());
  const userNotifications = allNotifications.filter(([, { userId }]) => userId === interaction.user.id);

  if (!userNotifications.length) return { content: "❌ You have no notifications.", embeds: [], components: []};

  const message: InteractionReplyOptions & InteractionUpdateOptions = {
    content: `📋 Your notifications for channel <#${countingChannelId}>: (${userNotifications.length}/${limits.notifications.amount})`,
    embeds: [
      {
        fields: userNotifications.map(([id, notification], index) => ({
          name: `• ${index + 1}: \`${id}\``,
          value: `*${triggers[notification.trigger.type].explanation(notification.trigger.data as never)}*`,
        })),
        color: config.colors.info,
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            placeholder: "Delete a notification",
            customId: `${uniqueIdentifier}:select_for_delete`,
            minValues: 1,
            maxValues: 1,
            options: userNotifications.map(([id, notification], index) => ({
              label: `${index + 1}: ${id}`,
              value: id,
              description: triggers[notification.trigger.type].explanation(notification.trigger.data as never),
            })),
          },
        ],
      },
    ],
    ephemeral,
  };

  components.set(`${uniqueIdentifier}:select_for_delete`, {
    type: "SELECT_MENU",
    allowedUsers: [interaction.user.id],
    callback(select) {
      void select.reply({
        content: "💢 Are you sure you want to delete this notification?",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                label: "No, cancel",
                customId: `${select.id}:cancel`,
                style: ButtonStyle.Secondary,
              },
              {
                type: ComponentType.Button,
                label: "Yes, I'm sure",
                customId: `${select.id}:confirm`,
                style: ButtonStyle.Danger,
              },
            ],
          },
        ],
        ephemeral,
      });

      components.set(`${select.id}:confirm`, {
        type: "BUTTON",
        allowedUsers: [interaction.user.id],
        callback(confirm) {
          const [notificationId] = select.values as [string];
          countingChannel.notifications.delete(notificationId);
          document.safeSave();

          void confirm.update({
            content: "✅ Notification deleted.",
            components: [],
          });

          void interaction.editReply(refreshList(interaction, ephemeral, document, [countingChannelId, countingChannel], interaction.id));
        },
      });

      components.set(`${select.id}:cancel`, {
        type: "BUTTON",
        allowedUsers: [interaction.user.id],
        callback(cancel) {
          void cancel.update({
            content: "💨 Cancelled deletion.",
            components: [],
          });
        },
      });
    },
  });

  return message;
}

export default { ...command } as ChatInputCommand;
