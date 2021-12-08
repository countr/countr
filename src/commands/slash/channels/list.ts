import { SlashCommand } from "../../../types/command";
import config from "../../../config";
import limits from "../../../constants/limits";
import numberSystems from "../../../constants/numberSystems";

export default {
  description: "Link an existing channel to Countr",
  options: [],
  execute: (interaction, ephemeralPreference, __, document) => {
    if (!document.channels.size) {
      return interaction.reply({
        content: "❌ This server has no counting channels set up.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `📋 The server has **${document.channels.size}/${limits.channels.amount}** counting channels.`,
      embeds: Array.from(document.channels.entries()).map(([channelId, channel]) => ({
        color: parseInt(channelId) % 0xFFFFFF, // unique color for each channel
        description: `**<#${channelId}>** - **${numberSystems[channel.type].name}**`,
        fields: [
          {
            name: "Count",
            value: `**${channel.count.number}** ${channel.count.userId ? `(counted by <@${channel.count.userId}>) ${channel.count.messageId ? `- [**Go to message**](https://discord.com/channels/${[interaction.guildId, channelId, channel.count.messageId].join("/")})` : ""}` : ""}`,
            inline: true,
          },
          {
            name: "Modules",
            value: channel.modules.length ? `**${channel.modules.sort().map(module => `\`${module}\``).join(", ")}**` : "None.",
            inline: true,
          },
          {
            name: "Filters",
            value: `**${channel.filters.length === 1 ? "1 filter" : `${channel.filters.length} filters`}**.`,
            inline: true,
          },
          {
            name: "Scores",
            value: `**${channel.scores.size === 1 ? "1 user" : `${channel.scores.size} users`}**.`,
            inline: true,
          },
          {
            name: "Flows",
            value: `**${channel.flows.size === 1 ? "1 flow" : `${channel.flows.size} flows`}**.`,
            inline: true,
          },
          {
            name: "Timeout role",
            value: channel.timeoutRole ? `Whenever someone fails ${channel.timeoutRole.fails} times within ${channel.timeoutRole.time} seconds, they will get the <@&${channel.timeoutRole.roleId}> role${channel.timeoutRole.duration ? `, and it will be removed after ${channel.timeoutRole.duration} seconds` : ""}.` : "None.",
            inline: true,
          },
          {
            name: "Notifications",
            value: `**${channel.notifications.size === 1 ? "1 notification" : `${channel.notifications.size} notifications`}**.`,
            inline: true,
          },
          {
            name: "Timeouts",
            value: `**${channel.timeouts.size === 1 ? "1 timeout" : `${channel.timeouts.size} timeouts`}**.`,
            inline: true,
          },
          ...config.isPremium ?
            [
              {
                name: "Liveboard",
                value: channel.liveboard?.channelId ? `[**Go to liveboard**](https://discord.com/channels/${[interaction.guildId, channel.liveboard.channelId, channel.liveboard.messageId].join("/")})` : "Not set up.",
                inline: true,
              },
            ] :
            [],
        ].filter(Boolean),
      })),
      ephemeral: ephemeralPreference,
    });
  },
} as SlashCommand;
