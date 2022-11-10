import type { Message } from "discord.js";
import { countingLogger } from "../../../utils/logger/counting";
import { inspect } from "util";

export default function repostWithReposting(message: Message<true>): Promise<Message> {
  return message.channel.send(`${message.author.toString()}: ${message.content}`)
    .catch(err => {
      countingLogger.error(`Failed to repost (reposting) message ${message.id}, channel ${message.channel.id}, guild ${message.guild.id}, member ${message.author.id}: ${inspect(err)}`);
      return message;
    });
}
