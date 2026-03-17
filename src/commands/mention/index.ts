import type { Awaitable, Message, MessageEditOptions, MessageReplyOptions, Snowflake } from "discord.js";
import type { DebugCommandLevel } from "../../constants/permissions";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

export type MentionCommand = {
  aliases?: [string, ...string[]];
  debugLevel: DebugCommandLevel;
  disableInCountingChannel?: true;
  premiumOnly?: true;
  testArgs(args: string[]): boolean;
} & (
  {
    execute(message: Message<true>, reply: (options: MessageEditOptions & MessageReplyOptions | string) => Promise<Message>, args: string[], document: GuildDocument, selectedCountingChannel: [countingChannelId: null | Snowflake, countingChannel: CountingChannelSchema | null]): Awaitable<Message>;
    requireSelectedCountingChannel?: never;
  } | {
    execute(message: Message<true>, reply: (options: MessageEditOptions & MessageReplyOptions | string) => Promise<Message>, args: string[], document: GuildDocument, selectedCountingChannel: [countingChannelId: Snowflake, countingChannel: CountingChannelSchema]): Awaitable<Message>;
    requireSelectedCountingChannel: true;
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
