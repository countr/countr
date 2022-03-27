import type { CountingData } from ".";
import { countrLogger } from "../../utils/logger/countr";
import { onTimeout as handleFlowsOnTimeout } from "./flows";
import { inspect } from "util";

const countingFails = new Map<string, number>();

export default async (data: CountingData): Promise<void> => {
  const { channel, member, document, message, countingChannel: { timeoutRole, timeouts }} = data;
  if (!timeoutRole) return;

  const fails = countingFails.get([channel.id, member.id].join(".")) || 0;
  countingFails.set([channel.id, member.id].join("."), fails + 1);

  setTimeout(() => countingFails.set([channel.id, member.id].join("."), countingFails.get([channel.id, member.id].join(".")) as number - 1), timeoutRole.time * 1000);

  if (fails >= timeoutRole.fails) {
    if (timeoutRole.duration) {
      timeouts.set(member.id, new Date(Date.now() + timeoutRole.duration * 1000));
      document.safeSave();
    }

    try {
      await member.roles.add(timeoutRole.roleId, `Timeout from channel #${channel.name} (${channel.id}) applied`);
      if (timeoutRole.duration) {
        setTimeout(() => {
          member.roles.remove(timeoutRole.roleId, `Timeout from channel #${channel.name} (${channel.id}) expired`);
          timeouts.delete(member.id);
          document.safeSave();
        }, timeoutRole.duration * 1000);
      }
    } catch (e) {
      countrLogger.verbose(`Failed to set role on member ${member.id} on timeout from ${message.url}: ${inspect(e)}`);
    }

    handleFlowsOnTimeout(data);
  }
};
