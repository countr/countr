import type { ButtonInteraction, SelectMenuInteraction } from "discord.js";
import type { ChatInputCommand } from "..";
import { ComponentType } from "discord.js";
import type { NotificationSchema } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import { fitText } from "../../../utils/text";
import { generateId } from "../../../utils/crypto";
import limits from "../../../constants/limits";
import { promptProperty } from "../../../constants/editors/properties";
import triggers from "../../../constants/triggers";

const command: ChatInputCommand = {
  description: "Get notified when the server reaches a certain count",
  considerDefaultPermission: true,
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const userNotifications = Array.from(countingChannel.notifications.values()).filter(notification => notification.userId === interaction.user.id);
    if (userNotifications.length >= limits.notifications.amount) {
      return void interaction.reply({
        content: `❌ You can only have up to **${limits.notifications.amount}** notifications at a time.`,
        ephemeral: true,
      });
    }

    void interaction.reply({
      content: "🔻 When do you want to be notified?",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.SelectMenu,
              placeholder: "Select a notification trigger",
              customId: `${interaction.id}:select_trigger`,
              minValues: 1,
              maxValues: 1,
              options: Object.entries(triggers)
                .filter(([, { supports }]) => supports.includes("notifications"))
                .map(([type, { name, description }]) => ({
                  label: name,
                  ...description && { description: fitText(description, 100) },
                  value: type,
                })),
            },
          ],
        },
      ],
      ephemeral,
    });

    components.set(`${interaction.id}:select_trigger`, {
      type: "SELECT_MENU",
      allowedUsers: [interaction.user.id],
      async callback(selectInteraction) {
        const [type] = selectInteraction.values as [keyof typeof triggers];
        const trigger = triggers[type];

        const notificationSchema: NotificationSchema = {
          userId: interaction.user.id,
          trigger: {
            type,
            data: [] as never,
          },
        };

        let currentInteraction: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached"> = selectInteraction;
        if (trigger.properties?.length) {
          for (const property of trigger.properties) {
            const result = await promptProperty(currentInteraction, interaction.user.id, property);
            const [data, nextInteraction] = result as [unknown, ButtonInteraction<"cached">];
            currentInteraction = nextInteraction;
            if (data === null) break;
            notificationSchema.trigger.data.push(data as never);
          }
        }

        if ((trigger.properties?.length ?? 0) !== (notificationSchema.trigger.data.length as number)) {
          return void currentInteraction.update({
            content: "❌ Cancelled.",
            embeds: [],
            components: [],
          });
        }

        // check if the user has more notifications than the limit again
        const userNotificationsBeforeSave = Array.from(countingChannel.notifications.values()).filter(notification => notification.userId === interaction.user.id);
        if (userNotificationsBeforeSave.length >= limits.notifications.amount) {
          return void currentInteraction.update({
            content: `❌ You can only have up to **${limits.notifications.amount}** notifications at a time. Nice try though.`,
            embeds: [],
            components: [],
          });
        }

        const notificationId = generateId();
        countingChannel.notifications.set(notificationId, notificationSchema);
        document.safeSave();

        const explanation = trigger.explanation(notificationSchema.trigger.data as never);
        return void currentInteraction.update({
          content: `✅ Notification created, you will be notified ${explanation.charAt(0).toLowerCase() + explanation.slice(1)} in <#${countingChannelId}>.`,
          embeds: [],
          components: [],
        });
      },
    });

    return void 0;
  },
};

export default { ...command } as ChatInputCommand;
