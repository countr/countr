import type { GuildMember, MessageEmbedOptions } from "discord.js";
import type { CountingData } from ".";
import config from "../../config";
import { countrLogger } from "../../utils/logger/countr";
import { embedsPerMessage } from "../../constants/discord";
import { inspect } from "util";
import triggers from "../../constants/triggers";

export default async (data: CountingData): Promise<void> => {
  const { countingChannel, message, countingMessageId } = data;

  for (const [id, { userId, trigger }] of Array.from(countingChannel.notifications.entries())) {
    if (await triggers[trigger.type].check(data, trigger.data)) {
      const url = message.url.replace(message.id, countingMessageId);
      try {
        const receiver = await message.guild?.members.fetch(userId);
        if (receiver) queue(data, id, receiver, url);
      } catch (e) {
        countrLogger.verbose(`Error sending notification about ${url} to ${userId}: ${inspect(e)}`);
      }
    }
  }
};

const queuedEmbeds = new Map<string, Array<MessageEmbedOptions>>();
export const blockedUsers = new Set<string>();

function queue(data: CountingData, id: string, receiver: GuildMember, messageUrl: string) {
  const { count, message } = data;
  const embed: MessageEmbedOptions = {
    description: [
      `🎉 **${message.guild?.toString()} reached ${count} total counts!**`,
      `The user who sent it was ${message.author.toString()}.`,
      "",
      `[**→ Click here to jump to the message!**](${messageUrl})`,
    ].join("\n"),
    color: config.colors.primary,
    timestamp: Date.now(),
    thumbnail: {
      url: message.author.displayAvatarURL({ dynamic: true, size: 512 }),
    },
    footer: {
      text: `Notification ID ${id}`,
    },
  };

  const queued = queuedEmbeds.get(receiver.id);
  if (queued) {
    queuedEmbeds.set(receiver.id, [...queued, embed]);
  } else {
    queuedEmbeds.set(receiver.id, [embed]);

    const send = (): void => {
      if (blockedUsers.has(receiver.id)) return void queuedEmbeds.delete(receiver.id);

      const embeds = queuedEmbeds.get(receiver.id);
      if (embeds?.length) {
        receiver.send({ embeds: embeds.slice(0, embedsPerMessage) }).catch(() => {
          blockedUsers.add(receiver.id);
          setTimeout(() => blockedUsers.delete(receiver.id), 1000 * 60 * 30);
          countrLogger.verbose(`Blocked user ${receiver.id} for 30 minutes for having closed DMs`);
        });

        if (embeds.length > embedsPerMessage) {
          queuedEmbeds.set(receiver.id, embeds.slice(embedsPerMessage));
          return void setTimeout(send, 15000);
        }
      }

      queuedEmbeds.delete(receiver.id);
    };

    setTimeout(send, 5000);
  }
}
