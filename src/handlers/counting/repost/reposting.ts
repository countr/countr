import type { DiscordAPIError, Message } from "discord.js";
import { countingLogger } from "../../../utils/logger/counting";
import { inspect } from "util";

export default function repostWithReposting(message: Message<true>): Promise<Message> {
  return message.channel.send(`${message.author.toString()}: ${message.content}`)
    .catch((err: DiscordAPIError) => {
      const { guildId, channelId, id: messageId, author: { id: authorId }} = message;
      countingLogger.error(`Failed to repost message in guild (${guildId}) [EMBED]:\n${inspect({ messageId, authorId, guildId, channelId, err })}`);
      return message;
    });
}
