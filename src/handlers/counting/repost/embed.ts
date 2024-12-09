import type { Message } from "discord.js";
import { inspect } from "util";
import countingLogger from "../../../utils/logger/counting";

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
    countingLogger.error(`Failed to repost (embed) message ${message.id}, channel ${message.channel.id}, guild ${message.guild.id}, member ${message.author.id}: ${inspect(err)}`);
    return message;
  }
}
