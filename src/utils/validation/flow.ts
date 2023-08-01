import type { JSONSchemaType } from "ajv";
import Ajv from "ajv";
import actions from "../../constants/flows/actions";
import limits from "../../constants/limits";
import triggers from "../../constants/triggers";
import type { FlowSchema } from "../../database/models/Guild";

const ajv = new Ajv({ strictTuples: false });

const schema: JSONSchemaType<FlowSchema> = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2, maxLength: 32, nullable: true },
    disabled: { type: "boolean" },
    triggers: {
      type: "array",
      minItems: 1,
      maxItems: limits.flows.triggers,
      items: {
        type: "object",
        oneOf: Object.entries(triggers).map(([type, { properties }]) => ({
          type: "object",
          properties: {
            type: { type: "string", const: type as keyof typeof triggers },
            data: { type: "array", ...properties ? { items: properties.map(property => property.schema) } : { minItems: 0, maxItems: 0 } },
          },
        })),
        required: ["type", "data"],
      },
    },
    actions: {
      type: "array",
      minItems: 1,
      maxItems: limits.flows.actions,
      items: {
        type: "object",
        oneOf: Object.entries(actions).map(([type, { properties }]) => ({
          type: "object",
          properties: {
            type: { type: "string", const: type as keyof typeof actions },
            data: { type: "array", ...properties ? { items: properties.map(property => property.schema) } : { minItems: 0, maxItems: 0 } },
          },
        })),
        required: ["type", "data"],
      },
    },
    actionIsRandomized: { type: "boolean" },
    allTriggersMustPass: { type: "boolean" },
  },
  required: ["triggers", "actions"],
  additionalProperties: false,
};

export const validateFlow = ajv.compile(schema);

export function parseFlow(json: string): FlowSchema | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return validateFlow(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
}
