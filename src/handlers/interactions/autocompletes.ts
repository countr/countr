import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, Snowflake } from "discord.js";
import type { ChatInputCommand } from "../../commands/chatInput";
import type { Autocomplete } from "../../constants/autocompletes";
import { selectedCountingChannels } from "../../constants/selectedCountingChannel";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

export default async function autocompleteHandler(interaction: AutocompleteInteraction<"cached">, document: GuildDocument): Promise<void> {
  const path = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)].filter(Boolean);

  const { default: command } = await import(`../../commands/chatInput/${path.join("/")}`) as { default?: ChatInputCommand };
  if (!command) return;

  const autocompletes = command.autocompletes ?? {};
  const { name, value } = interaction.options.getFocused(true);
  const autocomplete = autocompletes[name];
  if (!autocomplete) return;

  return runAutocomplete(value, autocomplete, interaction, document).then(choices => interaction.respond(choices));
}

async function runAutocomplete(value: boolean | number | string, autocomplete: Autocomplete, interaction: AutocompleteInteraction<"cached">, document: GuildDocument): Promise<ApplicationCommandOptionChoiceData[]> {
  const inCountingChannel = document.channels.has(interaction.channelId);
  const selectedCountingChannelId = inCountingChannel ? interaction.channelId : selectedCountingChannels.get(interaction.user.id)?.channel;
  const selectedCountingChannel: [Snowflake, CountingChannelSchema] | undefined = selectedCountingChannelId ? [selectedCountingChannelId, document.channels.get(selectedCountingChannelId)!] : document.getDefaultCountingChannel() ?? undefined; // eslint-disable-line no-undefined

  if (autocomplete.requireSelectedCountingChannel) {
    if (!selectedCountingChannel) return [{ name: "No counting channel selected. Use /select to select a counting channel.", value: "NO_COUNTING_CHANNEL_SELECTED" }];
    return autocomplete.execute(value, interaction, document, selectedCountingChannel);
  }

  return autocomplete.execute(value, interaction, document, (selectedCountingChannel ?? [null, null]) as never);
}
