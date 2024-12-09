import type { Awaitable } from "discord.js";
import type { CountingData } from "../../../handlers/counting";
import type { Property, PropertyValue } from "../../properties";
import giveRole from "./giveRole";
import lock from "./lock";
import modifyCount from "./modifyCount";
import modifyScore from "./modifyScore";
import pin from "./pin";
import pruneRole from "./pruneRole";
import react from "./react";
import sendMessage from "./sendMessage";
import setCount from "./setCount";
import setScore from "./setScore";
import takeRole from "./takeRole";
import uniqueRole from "./uniqueRole";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Action<ActionPropertyData extends PropertyValue[] = any> {
  description?: string;
  explanation(properties: ActionPropertyData): string;
  limitPerFlow?: number;
  name: string;
  properties?: [Property, ...Property[]];
  run(data: CountingData, properties: ActionPropertyData): Awaitable<boolean>;
}

// ordered in the way they appear when the user configures them
export default {
  giveRole,
  takeRole,
  pruneRole,
  uniqueRole,
  pin,
  sendMessage,
  lock,
  setCount,
  modifyCount,
  setScore,
  modifyScore,
  react,
} as const;
