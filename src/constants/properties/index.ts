import type { Schema } from "ajv";
import type { Awaitable, Guild } from "discord.js";
import type { PropertyInput } from "./inputs";
import anyNumber from "./anyNumber";
import channel from "./channel";
import emoji from "./emoji";
import numberPositive from "./numberPositive";
import numberPositiveOrNegative from "./numberPositiveOrNegative";
import numberPositiveOrZero from "./numberPositiveOrZero";
import regex from "./regex";
import roles from "./roles";
import text from "./text";

export type PropertyValue = number | PropertyValue[] | string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Property<T extends PropertyValue = any, U = T> {
  convert(userInput: U, guild: Guild): Awaitable<null | T>;
  description?: string;
  format(converted: T, guild: Guild): Awaitable<string>;
  input: PropertyInput<U>;
  name: string;
  schema: Schema;
}

export default { anyNumber, channel, emoji, numberPositive, numberPositiveOrNegative, numberPositiveOrZero, regex, roles, text } as const;
