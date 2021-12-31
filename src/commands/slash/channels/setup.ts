import { countingChannelPermissions, countingThreadParentChannelPermissions } from "../../../constants/discordPermissions";
import { ClientUser } from "discord.js";
import { CountingChannel } from "../../../database/models/Guild";
import { SlashCommand } from "../../../@types/command";
import limits from "../../../constants/limits";
import numberSystems from "../../../constants/numberSystems";

export default {
  description: "Link an existing channel to Countr",
  options: [
    {
      type: "STRING",
      name: "name",
      description: "The name of the channel you want to create",
    },
    {
      type: "CHANNEL",
      name: "thread_in",
      description: "The channel you want to make a thread in. Don't include this if you just want a regular text channel",
      channelTypes: ["GUILD_TEXT"],
    },
    {
      type: "STRING",
      name: "type",
      description: "The type of counting channel",
      choices: Object.entries(numberSystems).map(([value, system]) => ({ name: system.name, value })),
    },
  ],
  // eslint-disable-next-line camelcase -- slash command options can't be camel case, we make it camel case though
  execute: async (interaction, ephemeralPreference, { name = "Counting", thread_in: threadIn, type = Object.keys(numberSystems)[0] }: { name: string; thread_in?: string; type: string; }, document) => {
    if (document.channels.size >= limits.channels.amount) {
      return interaction.reply({
        content: `❌ You can't have more than **${limits.channels.amount}** counting channels in a guild.`,
        ephemeral: true,
      });
    }

    if (threadIn) { // thread channel
      const parent = await interaction.guild?.channels.fetch(threadIn).catch(() => null);
      if (!parent?.viewable || parent.type !== "GUILD_TEXT") {
        return interaction.reply({
          content: "❌ I couldn't find that channel. Do I have access?",
          ephemeral: true,
        });
      }

      const permissions = [...countingChannelPermissions, ...countingThreadParentChannelPermissions];
      if (!parent.permissionsFor(interaction.client.user as ClientUser, true)?.has(permissions, true)) {
        return interaction.reply({
          content: `⚠ I am missing permissions in the parent channel ${parent.toString()}: ${permissions.filter(p => !parent.permissionsFor(interaction.client.user as ClientUser)?.has(p, true)).map(p => `\`${p}\``).join(", ")}`,
          ephemeral: true,
        });
      }

      parent.threads.create({ name }).then(channel => {
        document.channels.set(channel.id, {
          count: {
            number: 0,
          },
          type,
          isThread: true,
        } as CountingChannel);
        document.safeSave();

        return interaction.reply({
          content: `✅ Successfully created ${channel.toString()}!`,
          ephemeral: ephemeralPreference || interaction.channelId === threadIn, // if the setup command is in the same channel then we make it ephemeral to avoid it sending two responses in chat (one of them being that the thread is created)
        });
      }).catch(() => interaction.reply({
        content: "❌ I couldn't create a thread in that channel. Do I have permission?",
        ephemeral: true,
      }));
    } else { // regular text channel
      const permissions = countingChannelPermissions;
      interaction.guild?.channels.create(name, {
        parent: interaction.guild.channels.cache.get(interaction.channelId)?.parentId || undefined,
        rateLimitPerUser: 2,
        permissionOverwrites: interaction.guild.me ?
          [
            {
              type: "member",
              id: interaction.guild.me,
              allow: permissions,
            },
          ] :
          [],
      }).then(channel => {
        document.channels.set(channel.id, {
          count: {
            number: 0,
          },
          type,
          isThread: false,
        } as CountingChannel);
        document.safeSave();

        return interaction.reply({
          content: `✅ Successfully created ${channel.toString()}!`,
          ephemeral: ephemeralPreference,
        });
      }).catch(() => interaction.reply({
        content: "❌ I couldn't create a counting channel. Do I have permission?",
        ephemeral: true,
      }));
    }
  },
} as SlashCommand;
