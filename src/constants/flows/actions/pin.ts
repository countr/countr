import type { Action } from ".";

const pin: Action<never> = {
  name: "Pin the count message",
  explanation: () => "Pin the count",
  run: async ({ countingMessage }) => {
    const pinned = await countingMessage.channel.messages.fetchPinned().catch(() => null);
    if (pinned?.size === 50) {
      await pinned.last()?.unpin()
        .then(() => countingMessage.pin().catch())
        .catch();
    } else await countingMessage.pin().catch();
    return false;
  },
  limit: 1,
};

export default pin;
