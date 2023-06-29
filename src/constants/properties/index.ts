import type { Schema } from "ajv";
import type { Awaitable, Guild } from "discord.js";
import anyNumber from "./anyNumber";
import channel from "./channel";
import emoji from "./emoji";
import type { PropertyInput } from "./inputs";
import numberPositive from "./numberPositive";
import numberPositiveOrNegative from "./numberPositiveOrNegative";
import numberPositiveOrZero from "./numberPositiveOrZero";
import regex from "./regex";
import roles from "./roles";
import text from "./text";

export type PropertyValue = PropertyValue[] | number | string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Property<T extends PropertyValue = any, U = T> {
  name: string;
  description?: string;
  schema: Schema;
  input: PropertyInput<U>;
  convert(userInput: U, guild: Guild): Awaitable<T | null>;
  format(converted: T, guild: Guild): Awaitable<string>;
}

export default { anyNumber, channel, emoji, numberPositive, numberPositiveOrNegative, numberPositiveOrZero, regex, roles, text } as const;
