import type { JSONSchemaType } from "ajv";
import type { Snowflake } from "discord.js";
import Ajv from "ajv";

const ajv = new Ajv({ strictTuples: false });

const schema: JSONSchemaType<Record<Snowflake, number>> = {
  type: "object",
  properties: {},
  patternProperties: { "^\\d{17,19}$": { type: "integer", minimum: 0 } },
  additionalProperties: false,
  required: [],
};

export const validateScores = ajv.compile(schema);

export function parseScores(json: string): null | Record<Snowflake, number> {
  try {
    const parsed: unknown = JSON.parse(json);
    return validateScores(parsed) ? parsed : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }
}
