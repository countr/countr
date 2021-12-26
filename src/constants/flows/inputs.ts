import { ApplicationCommandOptionData } from "discord.js";

export const ChannelInput: ApplicationCommandOptionData = {
  type: "CHANNEL",
  name: "channel",
  description: "A channel.",
};

export const NumberInput: ApplicationCommandOptionData = {
  type: "NUMBER",
  name: "number",
  description: "A number.",
};

export const RegexInput: ApplicationCommandOptionData = {
  type: "STRING",
  name: "regex",
  description: "A regex.",
};

// will be changed when role lists come out
export const RolesInput: ApplicationCommandOptionData = {
  type: "ROLE",
  name: "role",
  description: "A role.",
};

export const TextInput: ApplicationCommandOptionData = {
  type: "STRING",
  name: "text",
  description: "Any text.",
};
