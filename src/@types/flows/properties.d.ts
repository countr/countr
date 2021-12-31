import { ApplicationCommandOptionData, Guild } from "discord.js";

export type PropertyValue = string | number;

export interface Property {
  short: string;
  help: string;
  input: ApplicationCommandOptionData;
  isMultiple?: boolean;
  convert?(userInput: string | number, guild: Guild): Promise<PropertyValue | null>;
  format?(converted: Array<PropertyValue>, guild: Guild): Promise<string>;
}
