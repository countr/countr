import type { Property, PropertyValue } from "../../properties";
import type { Awaitable } from "discord.js";
import type { CountingData } from "../../../handlers/counting";
import giveRole from "./giveRole";
import lock from "./lock";
import modifyCount from "./modifyCount";
import modifyScore from "./modifyScore";
import pin from "./pin";
import pruneRole from "./pruneRole";
import sendMessage from "./sendMessage";
import setCount from "./setCount";
import setScore from "./setScore";
import takeRole from "./takeRole";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Action<ActionPropertyData extends PropertyValue[] = any> {
  name: string;
  description?: string;
  limit?: number;
  properties?: [Property, ...Property[]];
  explanation(properties: ActionPropertyData): string;
  run(data: CountingData, properties: ActionPropertyData): Awaitable<boolean>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ordered in the way they appear when the user configures them
export default {
  giveRole,
  takeRole,
  pruneRole,
  pin,
  sendMessage,
  lock,
  setCount,
  modifyCount,
  setScore,
  modifyScore,
} as const;
