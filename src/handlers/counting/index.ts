import { CountingChannel, GuildDocument } from "../../database/models/Guild";
import { Message, TextBasedChannel, TextChannel, ThreadChannel } from "discord.js";
import { addToCount } from "../../utils/cluster/stats";
import { countrLogger } from "../../utils/logger/countr";
import { getPermissionLevel } from "../../constants/permissions";
import numberSystems from "../../constants/numberSystems";
import regexTest from "../../utils/regex";

export default async (message: Message, document: GuildDocument, countingChannel: CountingChannel): Promise<void> => {
  const member = message.member || await message.guild?.members.fetch(message.author);
  const channel = message.channel as TextChannel || ThreadChannel;
  if (!member || !channel) return; // typescript

  const permissionLevel = getPermissionLevel(member);
  const { content } = message;
  if (content.startsWith("!") && permissionLevel >= 1) return; // ignore because staff member bypassed

  const { count, filters, modules, type } = countingChannel;
  const { convert } = numberSystems[type];

  const converted = modules.includes("talking") ? convert(content.split(" ")[0]) : convert(content);

  let regexMatch = false;
  for (const regex of filters) {
    if (await regexTest(regex, content)) {
      regexMatch = true;
      break;
    }
  }

  // test message and queue for deletion if it matches
  if (
    regexMatch ||
    !converted ||
    !modules.includes("allow-spam") && message.author.id === count.userId
  ) {
    // todo timeout role and count fail flows
    return queueDelete([message]);
  }

  // update counts
  count.number += 1;
  addToCount(1);

  // repost message if enabled
  let countingMessageId = message.id;

  if (modules.includes("webhook")) {
    try {
      const webhooks = await channel.fetchWebhooks();
      const webhook = webhooks.find(webhook => webhook.name === "Countr") || await channel.createWebhook("Countr").catch();

      if (webhook) {
        countingMessageId = await webhook.send({
          content,
          username: member.displayName,
          avatarURL: member.avatarURL({ dynamic: true }) || undefined,
          allowedMentions: {
            parse: [],
            roles: [],
            users: [],
          },
        }).then(m => m.id);
        queueDelete([message]);
      }
    } catch (e) {
      countrLogger.verbose(`Failed to replace message ${message.url} with webhook: ${JSON.stringify(e)}`);
    }
  } else if (modules.includes("embed")) {
    // todo
  }

  // todo notifications and flows
};

// bulks is an array of messages waiting to get bulk-deleted. channel id is the key of the map.
const bulks = new Map<string, Array<Message>>();
function queueDelete(messages: Array<Message>): void {
  if (!messages.length) return;
  const [{ channel }] = messages;

  const bulk = bulks.get(channel.id);
  if (!bulk && messages.length === 1) {
    messages[0].delete();
    bulks.set(channel.id, []); // wait for more
  } else if (bulk) return void bulk.push(...messages);
  else bulks.set(channel.id, [...bulks.get(channel.id) || [], ...messages]);

  setTimeout(() => bulkDelete(channel), 10000);
}

function bulkDelete(channel: TextBasedChannel): void {
  const bulk = bulks.get(channel.id);
  if (bulk?.[0] && ( // typescript
    bulk[0].channel.type === "GUILD_TEXT" ||
    bulk[0].channel.type === "GUILD_PRIVATE_THREAD" ||
    bulk[0].channel.type === "GUILD_PUBLIC_THREAD"
  )) {
    if (bulk.length > 2) bulk[0].channel.bulkDelete(bulk.slice(0, 100));
    else bulk[0].delete();

    const newBulk = bulk.slice(100);

    if (newBulk.length) {
      bulks.set(channel.id, newBulk);
      setTimeout(() => bulkDelete(channel), 10000);
    } else bulks.delete(channel.id);
  }
}
