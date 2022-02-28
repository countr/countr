import { SlashCommand } from "../../../@types/command";
import { regexHelpUrl } from "../../../constants/links";

export default {
  description: "Create a regex filter to disallow content from being posted in your counting channel",
  options: [
    {
      type: "STRING",
      name: "regex",
      description: `The regex to use. See ${regexHelpUrl} for help`,
      required: true,
    },
  ],
  execute: (interaction, ephemeralPreference, { regex }, document, selectedCountingChannel) => {
    if (!testRegex(regex as string)) {
      return interaction.reply({
        content: `❌ That doesn't look like a valid regex. See ${regexHelpUrl} for help.`,
        ephemeral: true,
      });
    }

    document.channels.get(selectedCountingChannel as string)?.filters.push(regex as string);
    document.safeSave();

    return interaction.reply({
      content: `✅ Added regex \`${regex}\` to counting channel <#${selectedCountingChannel}>.`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;

function testRegex(regex: string) {
  try {
    return new RegExp(regex);
  } catch (e) {
    return false;
  }
}
