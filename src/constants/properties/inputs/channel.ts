import type { PropertyInput } from ".";
import type { Snowflake } from "discord.js";

const channelInput: PropertyInput<Snowflake> = (interaction, currentValue) => new Promise(resolve => {
  resolve([currentValue ?? "", interaction]);
});

export default channelInput;
