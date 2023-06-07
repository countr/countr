import type { ContextMenuCommandInteraction, Snowflake } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import type { ContextMenuCommand } from "../../commands/menu";
import config from "../../config";
import { selectedCountingChannels } from "../../constants/selectedCountingChannel";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

export default async function contextMenuCommandHandler(interaction: ContextMenuCommandInteraction<"cached">, document: GuildDocument): Promise<void> {
  const commands = config.guild ? interaction.client.guilds.cache.get(config.guild)?.commands : interaction.client.application.commands;
  const applicationCommand = commands?.cache.find(({ name }) => name === interaction.commandName);
  if (!applicationCommand) return;

  const { default: command } = await import(`../../commands/menu/${applicationCommand.name}`) as { default: ContextMenuCommand };

  const countingChannel = document.channels.get(interaction.channelId);
  if (command.disableInCountingChannel && countingChannel) return void interaction.reply({ content: "❌ This command is disabled in counting channels.", ephemeral: true });

  const selectedCountingChannelId = countingChannel ? interaction.channelId : selectedCountingChannels.get(interaction.user.id)?.channel;
  const selectedCountingChannel: [Snowflake, CountingChannelSchema] | undefined = selectedCountingChannelId ? [selectedCountingChannelId, document.channels.get(selectedCountingChannelId)!] : document.getDefaultCountingChannel() ?? undefined; // eslint-disable-line no-undefined

  if (command.requireSelectedCountingChannel && !selectedCountingChannel) return void interaction.reply({ content: "💥 You need a counting channel selected to run this command. Type `/select` to select a counting channel and then run this command again.", ephemeral: true });

  if (command.type === ApplicationCommandType.Message && interaction.isMessageContextMenuCommand()) {
    const target = await interaction.channel?.messages.fetch(interaction.targetId).catch(() => null);
    if (!target) return;
    return command.execute(interaction, Boolean(countingChannel), target, document, (selectedCountingChannel ?? [null, null]) as never);
  }

  if (command.type === ApplicationCommandType.User && interaction.isUserContextMenuCommand()) {
    const target = await interaction.guild.members.fetch(interaction.targetId).catch(() => null);
    if (!target) return;
    return command.execute(interaction, Boolean(countingChannel), target, document, (selectedCountingChannel ?? [null, null]) as never);
  }
}
