import type { APIEmbed, GuildMember, User } from "discord.js";
import type { CountingData } from ".";
import config from "../../config";
import { embedsPerMessage } from "../../constants/discord";
import triggers from "../../constants/triggers";

export async function handleNotifications(countingData: CountingData): Promise<void> {
  for (const [notificationId, { userId, trigger }] of Array.from(countingData.countingChannel.notifications)) {
    if (await triggers[trigger.type].check?.(countingData, trigger.data as never)) {
      const member = await countingData.countingMessage.guild!.members.fetch({ user: userId, force: false }).catch(() => null);
      if (member) queue(member, countingData, notificationId);
    }
  }
}

const embedQueue = new Map<User, APIEmbed[]>();
const blockedUsers = new Set<User>();
function queue(member: GuildMember, countingData: CountingData, notificationId: string): void {
  const embed: APIEmbed = {
    description: [
      `🎉 **${countingData.member.guild.toString()} reached ${countingData.count} total counts!**`,
      `The user who sent it was ${countingData.member.toString()}.`,
      "",
      `[**→ Click here to jump to the message!**](${countingData.countingMessage.url})`,
    ].join("\n"),
    color: config.colors.primary,
    timestamp: countingData.message.createdAt.toISOString(),
    thumbnail: { url: countingData.member.displayAvatarURL({ forceStatic: false, size: 512 }) },
    footer: { text: `Notification ID ${notificationId}` },
  };

  const queued = embedQueue.get(member.user);
  if (queued) queued.push(embed);
  else {
    embedQueue.set(member.user, [embed]);

    setTimeout(function send(): void {
      if (blockedUsers.has(member.user)) return void embedQueue.delete(member.user);

      const embeds = embedQueue.get(member.user);
      if (embeds?.length) {
        void member.send({ embeds: embeds.slice(0, embedsPerMessage) });

        if (embeds.length > embedsPerMessage) {
          embedQueue.set(member.user, embeds.slice(embedsPerMessage));
          return void setTimeout(send, 15000);
        }
      }

      embedQueue.delete(member.user);
    }, 5000);
  }
}
