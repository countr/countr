import type { Message } from "discord.js";
import { countingLogger } from "../../../utils/logger/counting";
import { inspect } from "util";

export default async function repostWithEmbed(message: Message<true>): Promise<Message> {
  try {
    return await message.channel.send({
      embeds: [
        {
          description: `${message.author.toString()}: ${message.content}`,
          color: message.member?.displayColor ?? 3092790,
        },
      ],
    });
  } catch (err) {
    const { guildId, channelId, id: messageId, author: { id: authorId }} = message;
    countingLogger.error(inspect({ messageId, authorId, guildId, channelId, err }));
    return message;
  }
}
