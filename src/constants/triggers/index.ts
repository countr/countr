import type { Property, PropertyValue } from "../properties";
import type { Awaitable } from "discord.js";
import type { CountingData } from "../../handlers/counting";
import countFail from "./countFail";
import each from "./each";
import greater from "./greater";
import only from "./only";
import regex from "./regex";
import score from "./score";
import scoreGreater from "./scoreGreater";
import timeout from "./timeout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Trigger<TriggerPropertyData extends PropertyValue[] = PropertyValue[]> {
  name: string;
  description?: string;
  properties?: [Property, ...Property[]];
  supports: Array<"flows" | "notifications">;
  limitPerFlow?: number;
  explanation(properties: TriggerPropertyData): string;
  check?(data: CountingData, properties: TriggerPropertyData): Awaitable<boolean>;
}

// ordered in the way they appear when the user configures them
export default {
  each,
  only,
  score,
  regex,
  countFail,
  timeout,
  greater,
  scoreGreater,
} as const;
