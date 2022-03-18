import * as guilds from "../../database/guilds";
import type { AutocompleteInteraction } from "discord.js";
import type { SlashCommand } from "../../@types/command";
import { selectedCountingChannels } from "../../constants/selectedCountingChannels";

export default async (interaction: AutocompleteInteraction): Promise<void> => {
  const path = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)].filter(Boolean);

  const commandFile = (await import(`../../commands/slash/${path.join("/")}`)).default as SlashCommand;
  const autocompletes = commandFile.autocompletes || {};

  const { name, value } = interaction.options.getFocused(true);
  const autocomplete = autocompletes[name];

  if (autocomplete && interaction.guildId) {
    const document = await guilds.get(interaction.guildId);
    const isCountingChannel = document.channels.has(interaction.channelId);
    autocomplete(value, interaction, document, isCountingChannel ? interaction.channelId : selectedCountingChannels.get([interaction.guildId, interaction.user.id].join("."))?.channel).then(response => interaction.respond(response));
  }
};
