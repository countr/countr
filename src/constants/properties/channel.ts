import type { Property } from ".";
import type { Snowflake } from "discord.js";
import { channelInput } from "./inputs";
import { snowflakeRegex } from "../discord";

const channel: Property<Snowflake> = {
  name: "Channel",
  description: "Any text or thread channel. Make sure Countr has access to the channel.",
  schema: { type: "string", pattern: snowflakeRegex.source },
  input: channelInput,
  convert: userInput => userInput,
  format: channelId => `<#${channelId}>`,
};

export default channel;
