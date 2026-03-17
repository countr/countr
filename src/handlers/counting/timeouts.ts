import type { GuildMember } from "discord.js";
import type { CountingData } from ".";
import type { CountingChannelAllowedChannelType } from "../../constants/discord";
import { setSafeTimeout } from "../../utils/safe";
import { handleFlowsOnTimeout } from "./flows";

const countingFails = new Map<`${CountingChannelAllowedChannelType["id"]}-${GuildMember["id"]}`, number>();

export default async function handleTimeouts(countingData: CountingData): Promise<void> {
  if (!countingData.countingChannel.timeoutRole) return;

  const fails = (countingFails.get(`${countingData.channel.id}-${countingData.member.id}`) ?? 0) + 1;
  countingFails.set(`${countingData.channel.id}-${countingData.member.id}`, fails);

  void setSafeTimeout(() => {
    const newFails = (countingFails.get(`${countingData.channel.id}-${countingData.member.id}`) ?? 0) - 1;
    if (newFails) countingFails.set(`${countingData.channel.id}-${countingData.member.id}`, newFails);
    else countingFails.delete(`${countingData.channel.id}-${countingData.member.id}`);
  }, countingData.countingChannel.timeoutRole.timePeriod * 1000);

  if (fails >= countingData.countingChannel.timeoutRole.fails) {
    await countingData.member.roles.add(countingData.countingChannel.timeoutRole.roleId).catch();

    if (countingData.countingChannel.timeoutRole.duration) {
      countingData.countingChannel.timeouts.set(countingData.member.id, new Date(Date.now() + countingData.countingChannel.timeoutRole.duration * 1000));
      countingData.document.safeSave();

      void setSafeTimeout(() => {
        // race condition
        if (countingData.countingChannel.timeoutRole) void countingData.member.roles.remove(countingData.countingChannel.timeoutRole.roleId).catch();
        countingData.countingChannel.timeouts.delete(countingData.member.id);
        countingData.document.safeSave();
      }, countingData.countingChannel.timeoutRole.duration * 1000);
    }

    await handleFlowsOnTimeout(countingData);
  }
}
