import type { Snowflake } from "discord.js";

export interface SelectedCountingChannelDetails {
  channel: Snowflake;
  expires?: Date;
}

export const selectedCountingChannels = new Map<Snowflake, SelectedCountingChannelDetails>();

export const defaultExpirationValue = 1000 * 60 * 60 * 12;
