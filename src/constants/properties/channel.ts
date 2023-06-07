import type { Snowflake } from "discord.js";
import { snowflakeRegex } from "../discord";
import { channelInput } from "./inputs";
import type { Property } from ".";

const channel: Property<Snowflake> = {
  name: "Channel",
  description: "Any text or thread channel. Make sure Countr has access to the channel.",
  schema: { type: "string", pattern: snowflakeRegex.source },
  input: channelInput,
  convert: userInput => userInput,
  format: channelId => `<#${channelId}>`,
};

export default channel;
