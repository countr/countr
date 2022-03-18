import { SelectedCountingChannel, defaultExpirationValue, selectedCountingChannels } from "../../constants/selectedCountingChannels";
import type { ContextMenuCommand } from "../../@types/command";
import type { ContextMenuInteraction } from "discord.js";
import type { GuildDocument } from "../../database/models/Guild";
import config from "../../config";

export default async (interaction: ContextMenuInteraction, document: GuildDocument): Promise<void> => {
  if (!interaction.guild) return;
  const commands = config.guild ? interaction.client.guilds.cache.get(config.guild)?.commands : interaction.client.application?.commands;
  const command = commands?.cache.find(c => c.name === interaction.commandName);

  if (command) {
    const commandFile = (await import(`../../commands/${interaction.targetType === "USER" ? "user" : "message"}/${command.name}`)).default as ContextMenuCommand;

    const inCountingChannel = document.channels.has(interaction.channelId) || false;
    if (commandFile.disableInCountingChannel && inCountingChannel) {
      return interaction.reply({
        content: "❌ This command is disabled in counting channels.",
        ephemeral: true,
      });
    }

    let selectedCountingChannel: SelectedCountingChannel | undefined = inCountingChannel ?
      { channel: interaction.channelId } :
      selectedCountingChannels.get([interaction.guildId, interaction.user.id].join("."));

    if (selectedCountingChannel && (
      selectedCountingChannel.expires && selectedCountingChannel.expires < Date.now() ||
      !document.channels.has(selectedCountingChannel.channel) // check if channel is deleted
    )) {
      selectedCountingChannel = undefined;
      selectedCountingChannels.delete([interaction.guildId, interaction.user.id].join("."));
    }

    if (commandFile.requireSelectedCountingChannel && (
      !selectedCountingChannel ||
      selectedCountingChannel.expires && selectedCountingChannel.expires < Date.now()
    )) {
      if (document.channels.size === 1) {
        selectedCountingChannel = {
          channel: document.channels.keys().next().value,
          expires: Date.now() + defaultExpirationValue,
        };
      } else {
        return interaction.reply({
          content: "💥 You need a counting channel selected to run this command. Type `/select` to select a counting channel and then run this command again.",
          ephemeral: true,
        });
      }
      selectedCountingChannels.set([interaction.guildId, interaction.user.id].join("."), selectedCountingChannel);
    }

    commandFile.execute(interaction, inCountingChannel, interaction.targetId, document, selectedCountingChannel?.channel);
  }
};
