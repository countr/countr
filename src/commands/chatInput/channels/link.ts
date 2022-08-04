import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import type { CountingChannelAllowedChannelType, CountingChannelRootChannel } from "../../../constants/discord";
import { calculatePermissionsForChannel, countingChannelAllowedChannelTypes, countingChannelPermissions, countingChannelRootChannels, countingChannelRootPermissions } from "../../../constants/discord";
import type { ChannelType } from "discord.js";
import type { ChatInputCommand } from "..";
import type { CountingChannelSchema } from "../../../database/models/Guild";
import limits from "../../../constants/limits";
import numberSystems from "../../../constants/numberSystems";

const command: ChatInputCommand = {
  description: "Link a counting channel to Countr",
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "The channel you want to link into a counting channel",
      channelTypes: [...countingChannelAllowedChannelTypes],
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "count",
      description: "The current count in the counting channel",
      required: true,
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

    const channel = interaction.options.getChannel("channel", true) as CountingChannelAllowedChannelType;
    const count = interaction.options.getInteger("count", true);
    const countingSystem = (interaction.options.getString("counting_system") ?? "decimal") as keyof typeof numberSystems;

    if (document.channels.has(channel.id)) {
      return void interaction.reply({
        content: "❌ That channel is already linked to Countr.",
        ephemeral: true,
      });
    }

    const rootChannel = channel.isThread() && channel.parent as CountingChannelRootChannel | null || channel as CountingChannelRootChannel;
    if (!([...countingChannelRootChannels] as ChannelType[]).includes(rootChannel.type)) {
      return void interaction.reply({
        content: "❌ You can't link this channel because the parent is not a valid root channel.",
        ephemeral: true,
      });
    }

    const requiredPermissions = [...countingChannelPermissions, ...countingChannelRootPermissions];
    const currentPermissions = calculatePermissionsForChannel(rootChannel, await interaction.guild.members.fetch({ user: interaction.client.user!, force: false }));
    if (!currentPermissions.has(requiredPermissions, true)) {
      return void interaction.reply({
        content: `⚠ I am missing permissions in the channel <#${rootChannel.id}>: ${requiredPermissions.map(bigint => Object.entries(PermissionsBitField.Flags).find(([, permission]) => permission === bigint)?.[0]).join(", ")}`,
        ephemeral: true,
      });
    }

    document.channels.set(channel.id, {
      count: { number: count },
      type: countingSystem,
      isThread: rootChannel !== channel,
    } as CountingChannelSchema);
    document.safeSave();

    return void interaction.reply({ content: `✅ Successfully linked channel <#${rootChannel.id}> to Countr!`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
