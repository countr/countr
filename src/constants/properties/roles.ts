import type { Property } from ".";
import type { Snowflake } from "discord.js";
import { rolesInput } from "./inputs";
import { snowflakeRegex } from "../discord";

const roles: Property<Snowflake[]> = {
  name: "Role(s)",
  description: "Any role or list of roles. Make sure Countr is above the role(s).",
  schema: { type: "array", items: { type: "string", pattern: snowflakeRegex.source }, minItems: 1, uniqueItems: true },
  input: rolesInput,
  convert: userInput => userInput,
  format: roleIds => roleIds.map(roleId => `<@&${roleId}>`).join(", "),
};

export default roles;
