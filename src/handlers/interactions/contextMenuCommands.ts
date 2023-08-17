import { inspect } from "util";
import type { ContextMenuCommandInteraction, Snowflake } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import type { ContextMenuCommand } from "../../commands/menu";
import { docsUrl } from "../../constants/links";
import selectedCountingChannels from "../../constants/selectedCountingChannel";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import { legacyImportDefault } from "../../utils/import";
import commandsLogger from "../../utils/logger/commands";

export default async function contextMenuCommandHandler(interaction: ContextMenuCommandInteraction<"cached">, document: GuildDocument): Promise<void> {
  try {
    const command = await legacyImportDefault<ContextMenuCommand>(require.resolve(`../../commands/menu/${interaction.commandName}`));

    const countingChannel = document.channels.get(interaction.channelId);
    if (command.disableInCountingChannel && countingChannel) return void interaction.reply({ content: "❌ This command is disabled in counting channels.", ephemeral: true });

    if (command.requireSelectedCountingChannel && document.channels.size === 0) return void interaction.reply({ content: `💥 No counting channel is set up in this server! Create a new one by using \`/channels new\` or link an existing one with \`/channels link\`. New to Countr? Check out the [documentation](<${docsUrl}>) to get started!`, ephemeral: true });

    const selectedCountingChannelId = countingChannel ? interaction.channelId : selectedCountingChannels.get(interaction.user.id);
    const selectedCountingChannel: [Snowflake, CountingChannelSchema] | undefined = selectedCountingChannelId && document.channels.has(selectedCountingChannelId) ? [selectedCountingChannelId, document.channels.get(selectedCountingChannelId)!] : document.getDefaultCountingChannel() ?? undefined; // eslint-disable-line no-undefined

    if (command.requireSelectedCountingChannel && !selectedCountingChannel) return void interaction.reply({ content: "💥 You need a counting channel selected to run this command. Type `/select` to select a counting channel and then run this command again.", ephemeral: true });

    if (command.type === ApplicationCommandType.Message && interaction.isMessageContextMenuCommand()) {
      const target = await interaction.channel?.messages.fetch(interaction.targetId).catch(() => null);
      if (!target) return;
      return await command.execute(interaction, Boolean(countingChannel), target, document, (selectedCountingChannel ?? [null, null]) as never);
    }

    if (command.type === ApplicationCommandType.User && interaction.isUserContextMenuCommand()) {
      const target = await interaction.guild.members.fetch(interaction.targetId).catch(() => null);
      if (!target) return;
      return await command.execute(interaction, Boolean(countingChannel), target, document, (selectedCountingChannel ?? [null, null]) as never);
    }
  } catch (err) {
    commandsLogger.debug(`Failed to run interaction command $${interaction.commandName} on interaction ${interaction.id}, channel ${interaction.channelId}, guild ${interaction.guildId}, member ${interaction.user.id}: ${inspect(err)}`);
  }
}
