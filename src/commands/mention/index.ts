import type { Awaitable, Message, MessageOptions, Snowflake } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

export enum DebugCommandLevel { NONE, ADMIN, OWNER }

export type MentionCommand = {
  aliases?: [string, ...string[]];
  disableInCountingChannel?: true;
  debugLevel: DebugCommandLevel;
  premiumOnly?: true;
  testArgs(args: string[]): boolean;
} & (
  {
    requireSelectedCountingChannel: true;
    execute(message: Message & Message<true>, reply: (options: MessageOptions | string) => Promise<Message>, args: string[], document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<Message>;
  } | {
    requireSelectedCountingChannel?: never;
    execute(message: Message & Message<true>, reply: (options: MessageOptions | string) => Promise<Message>, args: string[], document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake | null, countingChannel: CountingChannelSchema | null]): Awaitable<Message>;
  }
);

export const quickResponses: Array<[
  triggers: [string, ...string[]],
  message: string,
]> = [
  [
    ["test", "testtwo"],
    "Test!",
  ],
];
