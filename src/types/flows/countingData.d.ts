import { Message } from "discord.js";
import { GuildDocument } from "../../database/models/Guild";

export type CountingData = {
  count: number;
  score: number;
  message: Message;
  countingMessage: Message;
  gdb: GuildDocument;
};
