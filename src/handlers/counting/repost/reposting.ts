import type { Message } from "discord.js";
import { inspect } from "util";
import countingLogger from "../../../utils/logger/counting";

export default function repostWithReposting(message: Message<true>): Promise<Message> {
  return message.channel.send(`${message.author.toString()}: ${message.content}`)
    .catch((err: unknown) => {
      countingLogger.error(`Failed to repost (reposting) message ${message.id}, channel ${message.channel.id}, guild ${message.guild.id}, member ${message.author.id}: ${inspect(err)}`);
      return message;
    });
}
