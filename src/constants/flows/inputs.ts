import { ApplicationCommandOptionData } from "discord.js";

export const ChannelInput: ApplicationCommandOptionData = {
  type: "CHANNEL",
  name: "channel",
  channelTypes: ["GUILD_NEWS", "GUILD_NEWS_THREAD", "GUILD_PRIVATE_THREAD", "GUILD_PUBLIC_THREAD", "GUILD_TEXT"],
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
