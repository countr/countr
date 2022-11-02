import type { Message } from "discord.js";
import { countingLogger } from "../../../utils/logger/counting";
import { inspect } from "util";

export default function repostWithReposting(message: Message<true>): Promise<Message> {
  return message.channel.send(`${message.author.toString()}: ${message.content}`).catch(err => {
    countingLogger.error(inspect(err));
    return message;
  });
}
