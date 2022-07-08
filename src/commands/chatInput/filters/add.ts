import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import regex from "../../../constants/properties/regex";

const command: ChatInputCommand = {
  description: "Add a regex filter",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "regex",
      description: "The regex to add",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, document, [, countingChannel]) {
    const input = interaction.options.getString("regex", true);

    if (countingChannel.filters.includes(input)) {
      return void interaction.reply({
        content: `❌ Filter \`${input}\` already exists.`,
        ephemeral,
      });
    }

    if (await regex.convert(input, interaction.guild) === null) {
      return void interaction.reply({
        content: "❌ Invalid regex.",
        ephemeral: true,
      });
    }

    countingChannel.filters.push(input);
    document.safeSave();

    return void interaction.reply({ content: `✅ Added filter \`${await regex.format(input, interaction.guild)}\`.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
