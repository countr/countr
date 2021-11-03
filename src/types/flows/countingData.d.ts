import { GuildDocument } from "../../database/models/Guild";
import { Message } from "discord.js";

export type CountingData = {
  count: number;
  score: number;
  message: Message;
  countingMessage: Message;
  gdb: GuildDocument;
};
