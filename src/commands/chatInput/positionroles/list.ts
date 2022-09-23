import { ButtonStyle, ComponentType } from "discord.js";
import type { InteractionReplyOptions, InteractionUpdateOptions, Snowflake } from "discord.js";
import type { ChatInputCommand } from "..";
import type { CountingChannelSchema } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";
import ordinal from "ordinal";

const command: ChatInputCommand = {
  description: "Get a list of position roles",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, _, [countingChannelId, countingChannel]) {
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
    ],
  };
}

export default { ...command } as ChatInputCommand;
