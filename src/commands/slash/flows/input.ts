import type { CommandInteraction } from "discord.js";
import type { SlashArgRecord } from "../../../handlers/interactions/commands";
import type { SlashCommand } from "..";
import { propertyTypes } from "../../../constants/flows/properties";

export const awaitingInput = new Map<string, (interaction: CommandInteraction, args: SlashArgRecord) => void>();

export default {
  description: "Add an input to a flow (the flow editor will ask you to run this command)",
  options: Object.values(propertyTypes).map(prop => prop.input).filter((prop, index, props) => props.indexOf(prop) === index),
  execute: (interaction, _, args) => {
    const awaiting = awaitingInput.get([interaction.channelId, interaction.user.id].join("."));
    if (awaiting) return awaiting(interaction, args);

    return interaction.reply({
      content: "❌ This command is used in the flow editor when editing a property, not by itself.",
      ephemeral: true,
    });
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
