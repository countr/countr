import { countingChannelPermissions, countingThreadParentChannelPermissions } from "../../../constants/discordPermissions";
import { CountingChannel } from "../../../database/models/Guild";
import { SlashCommand } from "../../../types/command";
import numberSystems from "../../../constants/numberSystems";

export default {
  description: "Link an existing channel to Countr",
  options: [
    {
      type: "CHANNEL",
      name: "channel",
      description: "The channel to link",
      channelTypes: ["GUILD_TEXT", "GUILD_PRIVATE_THREAD", "GUILD_PUBLIC_THREAD"],
      required: true,
    },
    {
      type: "INTEGER",
      name: "count",
      description: "The current count in the counting channel",
      required: true,
    },
    {
      type: "STRING",
      name: "type",
      description: "The type of counting channel",
      choices: Object.entries(numberSystems).map(([value, system]) => ({ name: system.name, value })),
    },
  ],
  execute: async (interaction, _, { channel: channelId, count, type = Object.keys(numberSystems)[0] }: { channel: string; count: number; type: string; }, document) => {
    const channel = await interaction.guild?.channels.fetch(channelId).catch(() => null) || interaction.guild?.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({
        content: "❌ I couldn't find that channel. Do I have access?",
        ephemeral: true,
      });
    }

    if (document.channels.has(channelId)) {
      return interaction.reply({
        content: "❌ That channel is already linked to Countr.",
        ephemeral: true,
      });
    }

    const isThread = channel.isThread();
    if (isThread) {
      const parent = await interaction.guild?.channels.fetch(channel.parentId || "").catch(() => null);
      if (!parent) {
        return interaction.reply({
          content: "❌ I couldn't find the parent channel to this thread. Do I have access?",
          ephemeral: true,
        });
      }

      const permissions = [...countingChannelPermissions, ...countingThreadParentChannelPermissions];
      if (!parent.permissionsFor(interaction.client.user || "", true)?.has(permissions, true)) {
        return interaction.reply({
          content: `⚠ I am missing permissions in the parent channel ${parent.toString()}: ${permissions.filter(p => !parent.permissionsFor(interaction.client.user || "")?.has(p, true)).map(p => `\`${p}\``).join(", ")}`,
          ephemeral: true,
        });
      }
    } else {
      const permissions = countingChannelPermissions;
      if (!channel.permissionsFor(interaction.client.user || "", true)?.has(permissions, true)) {
        return interaction.reply({
          content: `⚠ I am missing permissions in the channel ${channel.toString()}: ${permissions.filter(p => !channel.permissionsFor(interaction.client.user || "")?.has(p, true)).map(p => `\`${p}\``).join(", ")}`,
          ephemeral: true,
        });
      }
    }

    document.channels.set(channelId, {
      count: {
        number: count,
      },
      type,
      isThread,
    } as CountingChannel);
    console.log(document);
    document.safeSave();

    return interaction.reply({
      content: `✅ Successfully linked ${channel.toString()} to Countr!`,
    });
  },
} as SlashCommand;
