import { SelectMenuInteraction } from "discord.js";
import { SlashCommand } from "../../../@types/command";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";
import triggers from "../../../constants/triggers";

export default {
  description: "List and manage your notifications",
  execute: (interaction, ephemeralPreference, __, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel as string);
    if (!countingChannel) return;

    const allNotifications = Array.from(countingChannel.notifications.entries());
    const userNotifications = allNotifications.filter(([, notification]) => notification.userId === interaction.user.id);

    if (!userNotifications.length) {
      return interaction.reply({
        content: "❌ You have no notifications.",
        ephemeral: true,
      });
    }

    components.set(`${interaction.id}:delete`, _i => {
      const i = _i as SelectMenuInteraction;
      const toDelete = userNotifications.map(([id]) => id).filter(id => i.values.includes(id));

      toDelete.forEach(id => countingChannel.notifications.delete(id));
      document.safeSave();

      return i.update({
        content: `✅ Removed ${toDelete.length === 1 ? "1 notification" : `${toDelete.length} notifications`}. Run \`/notifications list\` again for a fresh list.`,
      });
    });

    return interaction.reply({
      content: `📋 You have ${userNotifications.length === 1 ? "1 notification" : `${userNotifications.length} notifications`} set up for channel <#${selectedCountingChannel}>:`,
      embeds: [
        {
          fields: userNotifications.map(([id, notification]) => {
            const { type, data } = notification.trigger;
            const { explanation } = triggers[type];
            return {
              name: `• ${id}`,
              value: `${explanation(data)}.`,
            };
          }),
          color: config.colors.info,
        },
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "SELECT_MENU",
              placeholder: "Select one or more notifications to delete",
              customId: `${interaction.id}:delete`,
              minValues: 1,
              options: userNotifications.map(([id, notification]) => ({
                label: `${id}`,
                description: `${triggers[notification.trigger.type].explanation(notification.trigger.data)}`,
                value: id,
              })),
            },
          ],
        },
      ],
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
