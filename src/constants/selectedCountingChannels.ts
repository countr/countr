export type SelectedCountingChannel = {
  channel: string;
  expires?: number;
};

export const selectedCountingChannels = new Map<string, SelectedCountingChannel>();

export const defaultExpirationValue = 1000 * 60 * 60 * 12;
