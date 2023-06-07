import { inspect } from "util";
import { ApplicationCommandOptionType, OverwriteType, PermissionsBitField } from "discord.js";
import type { ChatInputCommand } from "..";
import { calculatePermissionsForChannel, countingChannelPermissions, countingChannelRootChannels, countingChannelRootPermissions } from "../../../constants/discord";
import limits from "../../../constants/limits";
import numberSystems from "../../../constants/numberSystems";
import type { CountingChannelSchema } from "../../../database/models/Guild";
import mainLogger from "../../../utils/logger/main";

const command: ChatInputCommand = {
  description: "Create a new counting channel",
  serverCooldown: 10,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the channel you want to create",
    },
    {
      type: ApplicationCommandOptionType.Channel,
      name: "thread_in",
      description: "The channel you want to make a thread in. Don't include this if you just want a regular text channel",
      channelTypes: [...countingChannelRootChannels],
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "counting_system",
      description: "The counting system you want to use",
      choices: Object.entries(numberSystems).map(([value, { name }]) => ({ name, value })),
    },
  ],
  async execute(interaction, ephemeral, document) {
    if (document.channels.size >= limits.channels.amount) {
      return void interaction.reply({
        content: `❌ You can only have up to **${limits.channels.amount}** channels at a time.`,
        ephemeral: true,
      });
    }

    const name = interaction.options.getString("name") ?? "Counting";
    const threadParent = interaction.options.getChannel("thread_in", false, [...countingChannelRootChannels]);
    const countingSystem = (interaction.options.getString("counting_system") ?? "decimal") as keyof typeof numberSystems;

    const me = await interaction.guild.members.fetch({ user: interaction.client.user, force: false });

    if (threadParent) {
      const requiredPermissions = [...countingChannelPermissions, ...countingChannelRootPermissions];
      const currentPermissions = calculatePermissionsForChannel(threadParent, me);

      if (!currentPermissions.has(requiredPermissions, true)) {
        return void interaction.reply({
          content: `⚠ I am missing permissions in the parent channel <#${threadParent.id}>: ${requiredPermissions
            .map(bigint => Object.entries(PermissionsBitField.Flags).find(([, permission]) => permission === bigint && !currentPermissions.has(permission))?.[0])
            .filter(Boolean)
            .join(", ")}`,
          ephemeral: true,
        });
      }

      return void threadParent.threads.create({ name })
        .then(thread => {
          document.channels.set(thread.id, {
            count: { number: 0 },
            type: countingSystem,
            isThread: true,
          } as CountingChannelSchema);
          document.safeSave();

          return interaction.reply({ content: `✅ Successfully created ${thread.toString()}!`, ephemeral });
        })
        .catch(err => {
          mainLogger.verbose(`Failed to create counting channel in ${interaction.guildId}: ${inspect(err)}`);
          return interaction.reply({ content: "❌ I couldn't create a thread in that channel. Do I have permission?", ephemeral: true });
        });
    }

    // if not a thread
    const requiredPermissions = [...countingChannelPermissions];
    const parent = interaction.guild.channels.cache.get(interaction.channelId)?.parentId ?? null;

    return void interaction.guild.channels.create({
      name,
      ...parent && { parent },
      permissionOverwrites: [
        {
          type: OverwriteType.Member,
          id: me,
          allow: requiredPermissions,
        },
      ],
      rateLimitPerUser: 2,
    })
      .then(channel => {
        document.channels.set(channel.id, {
          count: { number: 0 },
          type: countingSystem,
          isThread: false,
        } as CountingChannelSchema);
        document.safeSave();

        return interaction.reply({ content: `✅ Successfully created <#${channel.id}>!`, ephemeral });
      })
      .catch(err => {
        mainLogger.verbose(`Failed to create counting channel in ${interaction.guildId}: ${inspect(err)}`);
        return interaction.reply({ content: "❌ I couldn't create a channel. Do I have permission?", ephemeral: true });
      });
  },
};

export default { ...command } as ChatInputCommand;
