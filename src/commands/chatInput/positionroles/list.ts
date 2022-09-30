import { ButtonStyle, ComponentType } from "discord.js";
import type { InteractionReplyOptions, InteractionUpdateOptions, Snowflake } from "discord.js";
import type { ChatInputCommand } from "..";
import type { CountingChannelSchema } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";
import { formatListToHuman } from "../../../utils/text";
import ordinal from "ordinal";

const command: ChatInputCommand = {
  description: "Get a list of position roles",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const roles = Array.from(countingChannel.positionRoles.entries())
      .map(([positionString, roleId]) => [Number(positionString), roleId] as [number, Snowflake])
      .sort((a, b) => a[0] - b[0]);

    if (!roles.length) {
      return void interaction.reply({
        content: "❌ There are no position roles set up for this counting channel",
        ephemeral: true,
      });
    }

    components.set(`${interaction.id}:view_desktop`, {
      type: "BUTTON",
      allowedUsers: [interaction.user.id],
      callback(button) {
        return void button.update(desktopView(roles, countingChannel, interaction.id));
      },
    });

    components.set(`${interaction.id}:view_mobile`, {
      type: "BUTTON",
      allowedUsers: [interaction.user.id],
      callback(button) {
        return void button.update(mobileView(roles, countingChannel, interaction.id));
      },
    });

    components.set(`${interaction.id}:delete_position_roles`, {
      type: "SELECT_MENU",
      allowedUsers: [interaction.user.id],
      callback(select) {
        const positions = select.values;

        components.set(`${select.id}:confirm`, {
          type: "BUTTON",
          allowedUsers: [interaction.user.id],
          callback(confirm) {
            for (const position of positions) {
              countingChannel.positionRoles.delete(String(position) as never);
              const roleId = roles[Number(position)]?.[1];
              if (roleId) countingChannel.metadata.delete(`positionRole-${roleId}`);
            }

            document.safeSave();

            return void confirm.update({
              content: `✅ Successfully deleted ${positions.length} position role${positions.length === 1 ? "" : "s"}.`,
              components: [],
            });
          },
        });

        components.set(`${select.id}:cancel`, {
          type: "BUTTON",
          allowedUsers: [interaction.user.id],
          callback(cancel) {
            return void cancel.update({
              content: "💨 Cancelled deletion.",
              components: [],
            });
          },
        });

        return void select.reply({
          content: `💢 Are you sure you want to delete position roles for position${positions.length === 1 ? "" : "s"} ${formatListToHuman(positions)}?`,
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
        });
      },
    });

    return void interaction.reply({
      content: `📋 Here's the list of position roles for counting channel <#${countingChannelId}>.`,
      ...desktopView(roles, countingChannel, interaction.id),
      ephemeral,
    });
  },
};

function desktopView(roles: Array<[number, Snowflake]>, countingChannel: CountingChannelSchema, uniqueIdentifier: string): InteractionReplyOptions & InteractionUpdateOptions {
  return {
    embeds: [
      {
        fields: [
          {
            name: "Position",
            value: `**${roles.map(([position]) => `${ordinal(position)}.`).join("\n")}**`,
            inline: true,
          },
          {
            name: "Role",
            value: roles.map(([, roleId]) => `<@&${roleId}>`).join("\n"),
            inline: true,
          },
          {
            name: "User",
            value: roles.map(([, roleId]) => {
              const memberId = countingChannel.metadata.get(`positionRole-${roleId}`);
              return memberId ? `<@${memberId}>` : "*None*";
            }).join("\n"),
            inline: true,
          },
        ],
        color: config.colors.info,
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "Change to mobile view",
            customId: `${uniqueIdentifier}:view_mobile`,
            style: ButtonStyle.Secondary,
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            placeholder: "Delete position roles ...",
            minValues: 1,
            maxValues: roles.length,
            customId: `${uniqueIdentifier}:delete_position_roles`,
            options: roles.map(([position, roleId]) => ({
              label: `Position ${position}, role with ID ${roleId}`,
              value: String(position),
            })),
          },
        ],
      },
    ],
  };
}

function mobileView(roles: Array<[number, Snowflake]>, countingChannel: CountingChannelSchema, uniqueIdentifier: string): InteractionReplyOptions & InteractionUpdateOptions {
  return {
    embeds: [
      {
        description: roles.map(([position, roleId]) => {
          const memberId = countingChannel.metadata.get(`positionRole-${roleId}`);
          return `**${ordinal(position)}.** <@&${roleId}> (${memberId ? `<@${memberId}>` : "*None*"})`;
        }).join("\n"),
        color: config.colors.info,
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "Change to desktop view",
            customId: `${uniqueIdentifier}:view_desktop`,
            style: ButtonStyle.Secondary,
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            placeholder: "Delete position roles ...",
            minValues: 1,
            maxValues: roles.length,
            customId: `${uniqueIdentifier}:delete_position_roles`,
            options: roles.map(([position, roleId]) => ({
              label: `Position ${position}, role with ID ${roleId}`,
              value: String(position),
            })),
          },
        ],
      },
    ],
  };
}

export default { ...command } as ChatInputCommand;
