import { ChannelInput, NumberInput, RegexInput, RolesInput, TextInput } from "./inputs";
import { getChannel, getRole } from "../resolvers";
import { Property } from "../../types/flows/properties";
import { joinListWithAnd } from "../../utils/text";

export const propertyTypes: Record<string, Property> = {
  numberX: {
    short: "Number (X)",
    help: "This can be any positive number.",
    input: NumberInput,
    convert: (userInput: number): Promise<number | null> => userInput > 0 ? Promise.resolve(userInput) : Promise.resolve(null),
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
  role: {
    short: "Role(s)",
    help: "This can be any role, or a list of roles. Make sure the roles are below Countr's highest role.",
    input: RolesInput,
    convert: async (userInputList: string, guild): Promise<Array<string> | null> => {
      const userInputs = userInputList.split(", ");
      const roles = [];
      for (const userInput of userInputs) {
        const result = await getRole(userInput, guild);
        if (result && result.id !== guild.roles.everyone.id) roles.push(result.id);
      }
      if (roles.length) return roles; return null;
    },
    format: (roleIds: Array<string>) => Promise.resolve(joinListWithAnd(roleIds.map(roleId => `<@&${roleId}>`))),
  },
  channel: {
    short: "Channel",
    help: "Any channel. Make sure Countr has access to the channel, and that it is a text based channel. (news channels and threads also work)",
    input: ChannelInput,
    convert: async (userInput: string, guild): Promise<string | null> => {
      const result = await getChannel(userInput, guild);
      if (result) return result.id; return null;
    },
    format: (channelId: string) => Promise.resolve(`<#${channelId}>`),
  },
  text: {
    short: "Text",
    help: ["Any text. Get creative with these placeholders:", "• `{count}` The count that triggered this flow", "• `{mention}` Mentions the user who triggered this flow", "• `{tag}` The tag of the user who triggered this flow", "• `{username}` The username of the user who triggered this flow", "• `{nickname}` The nickname of the user who triggered this flow", "• `{everyone}` Mentions the everyone-role", "• `{score}` The new score of the user who triggered this flow", "• `{content}` The content of the message that triggered this flow"].join("\n"),
    input: TextInput,
    format: (content: string) => Promise.resolve(`\`\`\`\n${content}\`\`\``),
  },
};
