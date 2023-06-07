import { PermissionsBitField } from "discord.js";
import type { ChatInputCommand } from "..";
import config from "../../../config";
import type { CountingChannelRootChannel } from "../../../constants/discord";
import { calculatePermissionsForChannel, countingChannelPermissions, countingChannelRootPermissions } from "../../../constants/discord";
import limits from "../../../constants/limits";
import { premiumHelpUrl } from "../../../constants/links";
import numberSystems from "../../../constants/numberSystems";

const command: ChatInputCommand = {
  description: "List all configured counting channels",
  async execute(interaction, ephemeral, document) {
    if (!document.channels.size) {
      return void interaction.reply({
        content: "❌ This server has no counting channels set up.",
        ephemeral: true,
      });
    }

    const me = await interaction.guild.members.fetch({ user: interaction.client.user, force: false });

    return void interaction.reply({
      content: `📋 The server has **${document.channels.size}/${limits.channels.amount}** counting channels.`,
      // eslint-disable-next-line complexity -- return object is eating up the "complexity" of this arrow function
      embeds: Array.from(document.channels.entries()).map(([countingChannelId, countingChannel], index) => {
        const errors: string[] = [];

        const channel = interaction.guild.channels.cache.get(countingChannelId);
        if (channel) {
          const rootChannel = channel.isThread() && channel.parent as CountingChannelRootChannel | null || channel as CountingChannelRootChannel;
          const requiredPermissions = [...countingChannelPermissions, ...rootChannel === channel ? [] : countingChannelRootPermissions];
          const currentPermissions = calculatePermissionsForChannel(rootChannel, me);
          if (!currentPermissions.has(requiredPermissions, true)) {
            const missingPermissions = requiredPermissions.filter(permission => !currentPermissions.has(permission));
            errors.push(`Missing permissions${rootChannel === channel ? "" : ` in <#${rootChannel.id}>`}: ${missingPermissions.map(bigint => Object.entries(PermissionsBitField.Flags).find(([, permission]) => permission === bigint && !currentPermissions.has(permission))?.[0]).join(", ")}`);
          }
        } else errors.push("The channel could not be found by the bot");

        if (index >= limits.channels.amount) errors.push("This channel exceeds the limit of counting channels you can have");

        return {
          color: errors.length ? config.colors.error : parseInt(countingChannelId, 10) % 0xFFFFFF,
          description: `**<#${countingChannelId}>** - **${numberSystems[countingChannel.type].name}**`,
          fields: [
            {
              name: "Count",
              value: countingChannel.count.number ?
                `**${countingChannel.count.number}** ${countingChannel.count.userId ? `(counted by <@${countingChannel.count.userId}>) ${countingChannel.count.messageId ? `- [**Go to message**](https://discord.com/channels/${[interaction.guildId, countingChannelId, countingChannel.count.messageId].join("/")})` : ""}` : ""}` :
                "0",
              inline: true,
            },
            {
              name: "Increment",
              value: String(countingChannel.increment),
              inline: true,
            },
            {
              name: "Modules",
              value: countingChannel.modules.length ?
                `**${countingChannel.modules
                  .sort((a, b) => a.localeCompare(b))
                  .map(module => `\`${module}\``)
                  .join(", ")
                }**` :
                "None.",
              inline: true,
            },
            {
              name: "Filters",
              value: countingChannel.filters.length ?
                `**${countingChannel.filters.length === 1 ? "1 filter" : `${countingChannel.filters.length} filters`}**.` :
                "None.",
              inline: true,
            },
            {
              name: "Scores",
              value: countingChannel.scores.size ?
                `**${countingChannel.scores.size === 1 ? "1 user" : `${countingChannel.scores.size} users`}**.` :
                "None.",
              inline: true,
            },
            {
              name: "Flows",
              value: countingChannel.flows.size ?
                `**${countingChannel.flows.size === 1 ? "1 flow" : `${countingChannel.flows.size} flows`}**.` :
                "None.",
              inline: true,
            },
            {
              name: "Timeout role",
              value: countingChannel.timeoutRole ?
                `Whenever someone fails ${countingChannel.timeoutRole.fails} times within ${countingChannel.timeoutRole.timePeriod} seconds, they will get the <@&${countingChannel.timeoutRole.roleId}> role${countingChannel.timeoutRole.duration ? `, and it will be removed after ${countingChannel.timeoutRole.duration} seconds` : ""}.` :
                "None.",
              inline: true,
            },
            {
              name: "Notifications",
              value: countingChannel.notifications.size ?
                `**${countingChannel.notifications.size === 1 ? "1 notification" : `${countingChannel.notifications.size} notifications`}**.` :
                "None.",
              inline: true,
            },
            {
              name: "Timeouts",
              value: countingChannel.timeouts.size ?
                `**${countingChannel.timeouts.size === 1 ? "1 timeout" : `${countingChannel.timeouts.size} timeouts`}**.` :
                "None.",
              inline: true,
            },
            {
              name: "Bypassable Roles",
              value: countingChannel.bypassableRoles.length ?
                countingChannel.bypassableRoles.map(roleId => `<@&${roleId}>`).join(", ") :
                "None.",
              inline: true,
            },
            {
              name: "Liveboard",
              value: countingChannel.liveboard?.channelId ?
                `[**Go to liveboard**](https://discord.com/channels/${[interaction.guildId, countingChannel.liveboard.channelId, countingChannel.liveboard.messageId].join("/")})` :
                String(config.isPremium ? "None." : `Premium only. **[Get Premium](${premiumHelpUrl})**.`),
              inline: true,
            },
            ...errors.length ?
              [
                {
                  name: "⚠️ Error Notice",
                  value: errors.map(error => `• ${error}`).join("\n"),
                },
              ] :
              [],
          ],
        };
      }),
      ephemeral,
    });
  },
};

export default { ...command } as ChatInputCommand;
