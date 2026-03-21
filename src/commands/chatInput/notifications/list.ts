import type { ChatInputCommandInteraction, InteractionReplyOptions, InteractionUpdateOptions, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import type { ChatInputCommand } from "..";
import type { CountingChannelSchema, GuildDocument } from "../../../database/models/Guild";
import config from "../../../config";
import limits from "../../../constants/limits";
import triggers from "../../../constants/triggers";
import { buttonComponents, selectMenuComponents } from "../../../handlers/interactions/components";
import { fitText } from "../../../utils/text";

const command: ChatInputCommand = {
  description: "List all your notifications",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeralPreference, document, countingChannelDetails) {
    return void interaction.reply({ ...refreshList(interaction, ephemeralPreference, document, countingChannelDetails, interaction.id), flags: ephemeralPreference || undefined
    });
  },
};

function refreshList(interaction: ChatInputCommandInteraction<"cached">, ephemeralPreference: MessageFlags.Ephemeral | 0, document: GuildDocument, [countingChannelId, countingChannel]: [Snowflake, CountingChannelSchema], uniqueIdentifier: string): InteractionReplyOptions & InteractionUpdateOptions {
  const allNotifications = Array.from(countingChannel.notifications.entries());
  const userNotifications = allNotifications.filter(([, { userId }]) => userId === interaction.user.id);

  if (!userNotifications.length) return { content: "❌ You have no notifications.", embeds: [], components: [] };

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
            type: ComponentType.StringSelect,
            placeholder: "Delete a notification",
            customId: `${uniqueIdentifier}:select_for_delete`,
            minValues: 1,
            maxValues: 1,
            options: userNotifications.map(([id, notification], index) => ({
              label: `${index + 1}: ${id}`,
              value: id,
              description: fitText(triggers[notification.trigger.type].explanation(notification.trigger.data as never), 100),
            })),
          },
        ],
      },
    ],
  };

  selectMenuComponents.set(`${uniqueIdentifier}:select_for_delete`, {
    selectType: "string",
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
        flags: ephemeralPreference || undefined,
      });

      buttonComponents.set(`${select.id}:confirm`, {
        allowedUsers: [interaction.user.id],
        callback(confirm) {
          const [notificationId] = select.values as [string];
          countingChannel.notifications.delete(notificationId);
          document.safeSave();

          void confirm.update({
            content: "✅ Notification deleted.",
            components: [],
          });

          void interaction.editReply(refreshList(interaction, ephemeralPreference, document, [countingChannelId, countingChannel], interaction.id));
        },
      });

      buttonComponents.set(`${select.id}:cancel`, {
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
