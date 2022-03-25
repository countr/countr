import { ChannelInput, NumberInput, RegexInput, RolesInput, TextInput } from "./inputs";
import type { Property } from "../../@types/flows/properties";
import { joinListWithAnd } from "../../utils/text";

export const propertyTypes: Record<string, Property> = {
  numberPositive: {
    short: "Number (Positive)",
    help: "This can be any positive number. Zero is not allowed.",
    input: NumberInput,
    convert: (userInput: number): Promise<number | null> => userInput > 0 ? Promise.resolve(userInput) : Promise.resolve(null),
  },
  numberPositiveOrZero: {
    short: "Number (Positive or zero)",
    help: "This can be any positive number, or zero.",
    input: NumberInput,
    convert: (userInput: number): Promise<number | null> => userInput >= 0 ? Promise.resolve(userInput) : Promise.resolve(null),
  },
  numberPositiveOrNegative: {
    short: "Number (Positive or negative)",
    help: "This can be any positive or negative number. Zero is not allowed.",
    input: NumberInput,
    convert: (userInput: number): Promise<number | null> => Promise.resolve(userInput === 0 ? null : userInput),
  },
  regex: {
    short: "Regex",
    help: "Get help on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices",
    input: RegexInput,
    convert: (userInput: string): Promise<string | null> => {
      try {
        RegExp(userInput);
        return Promise.resolve(userInput);
      } catch (e) {
        return Promise.resolve(null);
      }
    },
  },
  roles: {
    short: "Role(s)",
    help: "This can be any role, or a list of roles. Make sure the roles are below Countr's highest role.",
    input: RolesInput,
    isMultiple: true,
    convert: async (userInput: string, guild): Promise<string | null> => {
      const result = await guild.roles.fetch(userInput).catch(() => null);
      if (result && result.id !== guild.roles.everyone.id) return result.id; return null;
    },
    format: roleIds => Promise.resolve(joinListWithAnd(roleIds.map(roleId => `<@&${roleId}>`))),
  },
  channel: {
    short: "Channel",
    help: "Any channel. Make sure Countr has access to the channel, and that it is a text based channel. (news channels and threads also work)",
    input: ChannelInput,
    convert: async (userInput: string, guild): Promise<string | null> => {
      const result = await guild.channels.fetch(userInput).catch(() => null);
      if (result) return result.id; return null;
    },
    format: ([channelId]) => Promise.resolve(`<#${channelId}>`),
  },
  text: {
    short: "Text",
    help: ["Any text. Get creative with these placeholders:", "• `{count}` The count that triggered this flow", "• `{mention}` Mentions the user who triggered this flow", "• `{tag}` The tag of the user who triggered this flow", "• `{username}` The username of the user who triggered this flow", "• `{nickname}` The nickname of the user who triggered this flow", "• `{everyone}` Mentions the everyone-role", "• `{score}` The new score of the user who triggered this flow", "• `{content}` The content of the message that triggered this flow"].join("\n"),
    input: TextInput,
    format: ([content]) => Promise.resolve(`\`\`\`\n${content}\`\`\``),
  },
};
