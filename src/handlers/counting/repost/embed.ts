import type { Message } from "discord.js";

export default async function repostWithEmbed(message: Message<true>): Promise<Message> {
  try {
    const { displayColor } = await message.guild.members.fetch(message.author);
    return await message.channel.send({
      embeds: [
        {
          description: `${message.author.toString()}: ${message.content}`,
          color: displayColor || 3092790,
        },
      ],
    });
  } catch {
    return message;
  }
}
