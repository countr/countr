export type SelectedCountingChannel = {
  channel: string;
  expires: number;
};

export const selectedCountingChannels = new Map<string, SelectedCountingChannel>();
