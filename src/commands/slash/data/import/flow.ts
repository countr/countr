import { SlashCommand } from "../../../../types/command";

export default {
  description: "Import a flow configuration",
  execute: (interaction, _, __, document, selectedCountingChannel) => {
    // todo do this
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;

/* eslint-disable @typescript-eslint/no-explicit-any */
function isFlow(input: any): boolean /* input is Flow */ {
  return (
    (input.name === undefined || typeof input.name === "string") &&
    (input.disabled === undefined || typeof input.disabled === "boolean") &&
    (Array.isArray(input.triggers) && Array.isArray(input.actions)) &&
    input.triggers.length > 0 && input.actions.length > 0 &&
    [...input.triggers, ...input.actions].find(fo => isFlowOptions(fo) === false) === undefined
  );
}

function isFlowOptions(input: any): boolean /* input is FlowOptions */ {
  return (
    typeof input.type === "string" &&
    isPropertyValue(input.data)
  );
}

function isPropertyValue(input: any): boolean /* input is PropertyValue */ {
  return (
    typeof input === "string" ||
    typeof input === "number" ||
    Array.isArray(input) && input.every(value => isPropertyValue(value))
  );
}
