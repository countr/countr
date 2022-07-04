import Ajv from "ajv";
import type { JSONSchemaType } from "ajv";
import type { Snowflake } from "discord.js";

const ajv = new Ajv({ strictTuples: false });

const schema: JSONSchemaType<Record<Snowflake, number>> = {
  type: "object",
  properties: {},
  patternProperties: { "^\\d{17,19}$": { type: "integer", minimum: 0 }},
  additionalProperties: false,
  required: [],
};

export const validateScores = ajv.compile(schema);

export function parseScores(json: string): Record<Snowflake, number> | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return validateScores(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
}
