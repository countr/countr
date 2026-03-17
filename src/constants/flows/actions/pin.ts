import type { MessagePin } from "discord.js";
import type { Action } from ".";

const pin: Action<never> = {
  name: "Pin the count message",
  explanation: () => "Pin the count",
  run: async ({ countingMessage }) => {
    let fetchedPins = await countingMessage.channel.messages.fetchPins({ limit: 50 }).catch(() => null);
    let oldestPin = Array.from(fetchedPins?.items ?? []).reduce<MessagePin | null>((min, curr) => !min || curr.pinnedAt.getTime() < min.pinnedAt.getTime() ? curr : min, null) ?? null;
    const pinned: MessagePin[] = Array.from(fetchedPins?.items ?? []);
    while (fetchedPins?.hasMore && oldestPin) {
      fetchedPins = await countingMessage.channel.messages.fetchPins({ before: oldestPin.pinnedAt, limit: 50 }).catch(() => null);
      oldestPin = Array.from(fetchedPins?.items ?? []).reduce<MessagePin | null>((min, curr) => !min || curr.pinnedAt.getTime() < min.pinnedAt.getTime() ? curr : min, null) ?? null;
      pinned.push(...fetchedPins?.items ?? []);
    }

    if (pinned.length >= 250) {
      await oldestPin?.message.unpin()
        .then(() => countingMessage.pin().catch())
        .catch();
    } else await countingMessage.pin().catch();
    return false;
  },
  limitPerFlow: 1,
};

export default pin;
