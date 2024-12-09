import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, Snowflake } from "discord.js";
import type { ChatInputCommand } from "../../commands/chatInput";
import type { Autocomplete } from "../../constants/autocompletes";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import selectedCountingChannels from "../../constants/selectedCountingChannel";
import { legacyImportDefault } from "../../utils/import";

export default async function autocompleteHandler(interaction: AutocompleteInteraction<"cached">, document: GuildDocument): Promise<void> {
  const path = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)].filter(Boolean);

  const command = await legacyImportDefault<ChatInputCommand>(require.resolve(`../../commands/chatInput/${path.join("/")}`)).catch(() => null);
  if (!command) return;

  const autocompletes = command.autocompletes ?? {};
  const { name, value } = interaction.options.getFocused(true);
  const autocomplete = autocompletes[name];
  if (!autocomplete) return;

  return runAutocomplete(value, autocomplete, interaction, document).then(choices => interaction.respond(choices));
}

async function runAutocomplete(value: boolean | number | string, autocomplete: Autocomplete, interaction: AutocompleteInteraction<"cached">, document: GuildDocument): Promise<ApplicationCommandOptionChoiceData[]> {
  const inCountingChannel = document.channels.has(interaction.channelId);
  const selectedCountingChannelId = inCountingChannel ? interaction.channelId : selectedCountingChannels.get(interaction.user.id);
  const selectedCountingChannel: [Snowflake, CountingChannelSchema] | undefined = selectedCountingChannelId && document.channels.has(selectedCountingChannelId) ? [selectedCountingChannelId, document.channels.get(selectedCountingChannelId)!] : document.getDefaultCountingChannel() ?? undefined; // eslint-disable-line no-undefined

  if (autocomplete.requireSelectedCountingChannel) {
    if (!selectedCountingChannel) return [{ name: "No counting channel selected. Use /select to select a counting channel.", value: "NO_COUNTING_CHANNEL_SELECTED" }];
    return autocomplete.execute(value, interaction, document, selectedCountingChannel);
  }

  return autocomplete.execute(value, interaction, document, (selectedCountingChannel ?? [null, null]) as never);
}
