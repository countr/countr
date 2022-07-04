import type { PropertyInput } from ".";
import type { Snowflake } from "discord.js";

const rolesInput: PropertyInput<Snowflake[]> = interaction => Promise.resolve([null, interaction]);

export default rolesInput;
