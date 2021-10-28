export type PropertyValue = string | number | Array<PropertyValue>;

export interface Property {
  short: string;
  help: string;
  convert?(userInput: string, guild: Guild): Promise<PropertyValue | null>;
  format?(converted: PropertyValue, guild: Guild): Promise<string>;
}
