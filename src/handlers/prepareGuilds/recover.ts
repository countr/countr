import type { CountingChannelAllowedChannelType } from "../../constants/discord";
import type { Snowflake } from "discord.js";
import { messageFetchLimit } from "../../constants/discord";

export default async (channel: CountingChannelAllowedChannelType, lastMessageId: Snowflake): Promise<boolean> => {
  let messages = await channel.messages.fetch({ limit: messageFetchLimit, after: lastMessageId }).catch(() => null);
  if (messages?.size) {
    let processing = true;
    let fail = false;
    while (processing) {
      if (messages?.size) {
        const result = await channel.bulkDelete(messages)
          .then(() => true)
          .catch(() => false);

        if (result) messages = await channel.messages.fetch({ limit: messageFetchLimit, after: lastMessageId }).catch(() => null);
        else {
          fail = true;
          processing = false;
        }
      } else processing = false;
    }

    if (fail) await channel.send("❌ Failed to recover the counting channel. Please re-check permissions, and if you need help, contact a staff member in the support server.");
  }
  return false;
};
