import { Guild } from "discord.js";
import { getChannel, getRole } from "../resolvers";

export type PropertyValue = string | number;

export interface Property {
  short: string;
  help: string;
  convert?(userInput: string, guild: Guild): Promise<PropertyValue | null>;
  format?(converted: PropertyValue, guild: Guild): Promise<string>;
}

export const propertyTypes: Record<string, Property> = {
  "numberX": {
    short: "Number (X)",
    help: "This can be any positive number.",
    convert: async (userInput): Promise<number | null> => parseInt(userInput) || null
  },
  "regex": {
    short: "Regex",
    help: "Get help on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices",
    convert: async (userInput): Promise<string | null> => {
      try {
        new RegExp(userInput);
        return userInput;
      } catch(e) {
        return null;
      }
    }
  },
  "role": {
    short: "Role",
    help: "This can be any role. Make the role is below Countr's highest role.",
    convert: async (userInput, guild: Guild): Promise<string | null> => {
      const result = await getRole(userInput, guild);
      if (result && result.id !== guild.roles.everyone.id) return result.id; else return null;
    },
    format: async (roleId: string) => `<@&${roleId}>`,
  },
  "channel": {
    short: "Channel",
    help: "Any channel. Make sure Countr has access to the channel, and that it is a text based channel. (news channels and threads also work)",
    convert: async (userInput, guild: Guild): Promise<string | null> => {
      const result = await getChannel(userInput, guild);
      if (result) return result.id; else return null;
    },
    format: async (channelId: string) => `<#${channelId}>`,
  },
  "text": {
    short: "Text",
    help: [
      "Any text. Get creative with these placeholders:",
      "• `{count}` The count that triggered this flow",
      "• `{mention}` Mentions the user who triggered this flow",
      "• `{tag}` The tag of the user who triggered this flow",
      "• `{username}` The username of the user who triggered this flow",
      "• `{nickname}` The nickname of the user who triggered this flow",
      "• `{everyone}` Mentions the everyone-role",
      "• `{score}` The new score of the user who triggered this flow",
      "• `{content}` The content of the message that triggered this flow"
    ].join("\n"),
    format: async (content: string) => `\`\`\`\n${content}\`\`\``,
  }
};