import type { CountingChannel, GuildDocument } from "../../database/models/Guild";
import type { Message, PartialMessage } from "discord.js";

export default async function replaceMessage(message: Message | PartialMessage, document: GuildDocument, channel: CountingChannel) {
  if (
    message.id !== channel.count.messageId ||
    ["embed", "reposting", "webhook"].find(moduleName => channel.modules.includes(moduleName))
  ) return;

  const newMessage = await message.channel.send(`${message.author?.toString() || `<@${channel.count.userId}>`}: ${message.content || channel.count.number}`);
  if (channel.count.messageId === message.id) {
    channel.count.messageId = newMessage.id;
    document.safeSave();
  }
}
