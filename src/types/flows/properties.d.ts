import { ApplicationCommandOptionData, Guild } from "discord.js";

export type PropertyValue = string | number | Array<PropertyValue>;

export interface Property {
  short: string;
  help: string;
  input: ApplicationCommandOptionData;
  convert?(userInput: string | number, guild: Guild): Promise<PropertyValue | null>;
  format?(converted: PropertyValue, guild: Guild): Promise<string>;
}
