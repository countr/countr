import { CountingChannel, GuildDocument } from "../../database/models/Guild";
import { GuildMember, Message, TextChannel, ThreadChannel } from "discord.js";

export type CountingData = {
  channel: TextChannel | ThreadChannel;
  count: number;
  countingChannel: CountingChannel;
  countingMessageId: string;
  document: GuildDocument;
  member: GuildMember;
  message: Message;
  score: number;
};
