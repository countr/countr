import type { Awaitable } from "discord.js";
import type { CountingData } from "../../handlers/counting";
import type { Property, PropertyValue } from "../properties";
import countFail from "./countFail";
import each from "./each";
import greater from "./greater";
import only from "./only";
import regex from "./regex";
import score from "./score";
import scoreGreater from "./scoreGreater";
import timeout from "./timeout";
import userHasRole from "./userHasRole";


export interface Trigger<TriggerPropertyData extends PropertyValue[] = PropertyValue[]> {
  check?(data: CountingData, properties: TriggerPropertyData): Awaitable<boolean>;
  description?: string;
  explanation(properties: TriggerPropertyData): string;
  limitPerFlow?: number;
  name: string;
  properties?: [Property, ...Property[]];
  supports: Array<"flows" | "notifications">;
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
  userHasRole,
} as const;
