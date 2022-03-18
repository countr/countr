import type { Action } from "../../@types/flows/actions";
import { TextChannel } from "discord.js";
import { cacheHelpUrl } from "../links";
import { joinListWithAnd } from "../../utils/text";
import { propertyTypes } from "./properties";

const actions: Record<string, Action> = {
  giveRole: {
    short: "Give a role (or list of roles) to the user",
    long: "This will add a role, or a list of roles, to the user who triggered this flow.",
    properties: [propertyTypes.roles],
    explanation: ([roles]) => `Add the user to ${roles.length === 1 ? "role" : "roles"} ${joinListWithAnd(roles.map(role => `<@&${role}>`))}`,
    run: async ({ member }, [roleIds]: Array<Array<string>>) => {
      const roles = member.roles.cache.filter(r => !roleIds.includes(r.id));
      if (roles.size) await member.roles.add(roles).catch(() => null);
      return false;
    },
    limit: 1,
  },
  takeRole: {
    short: "Remove a role (or list of roles) from the user",
    long: "This will remove a role, or a list of roles, from the user who triggered this flow.",
    properties: [propertyTypes.roles],
    explanation: ([roles]) => `Remove the user from ${roles.length === 1 ? "role" : "roles"} ${joinListWithAnd(roles.map(role => `<@&${role}>`))}`,
    run: async ({ member }, [roleIds]: Array<Array<string>>) => {
      const roles = member.roles.cache.filter(r => roleIds.includes(r.id));
      if (roles.size) await member.roles.remove(roles).catch(() => null);
      return false;
    },
    limit: 1,
  },
  pruneRole: {
    short: "Remove everyone from a role (or list of roles)",
    long: `This will remove everyone from a role, or a list of roles.\nNote: This might not remove everyone from the role(s). This is due to caching. [Read more](${cacheHelpUrl})`,
    properties: [propertyTypes.roles],
    explanation: ([roles]) => `Remove everyone from ${roles.length === 1 ? "role" : "roles"} ${joinListWithAnd(roles.map(role => `<@&${role}>`))}`,
    run: async ({ message: { guild }}, [roleIds]: Array<Array<string>>) => {
      const roles = Array.from(guild?.roles.cache.filter(r => roleIds.includes(r.id)).values() || []);
      const members = Array.from(roles.map(role => Array.from(role.members.values())).flat().values());
      for (const member of members) {
        await member.roles.remove(member.roles.cache.filter(r => roleIds.includes(r.id))).catch();
        if (members.indexOf(member) !== members.length - 1) await sleep(1100);
      }
      return false;
    },
    limit: 1,
  },
  pin: {
    short: "Pin the count message",
    explanation: () => "Pin the count",
    run: async ({ countingMessageId, message }) => {
      const countingMessage = message.id === countingMessageId ? message : await message.channel.messages.fetch(countingMessageId).catch(() => null);
      if (countingMessage) {
        await countingMessage.pin().catch(async () => {
          const pinned = await message.channel.messages.fetchPinned().catch(() => null);
          if (pinned?.size === 50) await pinned.last()?.unpin().then(() => countingMessage.pin().catch()).catch();
        });
      }
      return false;
    },
    limit: 1,
  },
  sendMessage: {
    short: "Send a message",
    long: "This will send a message in any channel you'd like",
    properties: [propertyTypes.channel, propertyTypes.text],
    explanation: ([[channel], [text]]: Array<Array<string>>) => `Send a message in <#${channel}>: \`\`\`${text}\`\`\``,
    run: async ({ count, member, message: { guild, content }, score }, [[channelId], [text]]: Array<Array<string>>) => {
      const channel = guild?.channels.resolve(channelId);
      if (channel && channel.isText()) {
        await channel.send({
          content: text
            .replace(/{count}/gi, count.toString())
            .replace(/{mention}/gi, member.user.toString())
            .replace(/{tag}/gi, member.user.tag)
            .replace(/{username}/gi, member.user.username)
            .replace(/{nickname}/gi, member?.displayName || member.user.username)
            .replace(/{everyone}/gi, guild?.roles.everyone.toString() || "")
            .replace(/{score}/gi, score.toString())
            .replace(/{content}/gi, content),
          allowedMentions: { parse: ["everyone", "users", "roles"]},
        }).catch();
      }
      return false;
    },
  },
  lock: {
    short: "Lock the counting channel",
    long: "This will lock the counting channel for the everyone-role. This action won't work in threads as of right now.",
    explanation: () => "Lock the counting channel",
    run: async ({ channel }) => {
      if (channel instanceof TextChannel) await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SEND_MESSAGES: false });
      return false;
    },
    limit: 1,
  },
  setCount: {
    short: "Set the count",
    properties: [propertyTypes.numberPositiveOrZero],
    explanation: ([[number]]: Array<Array<number>>) => `Set the channel count to ${number}`,
    run: ({ countingChannel }, [[number]]: Array<Array<number>>) => {
      countingChannel.count.number = number;
      return Promise.resolve(true);
    },
    limit: 1,
  },
  modifyCount: {
    short: "Modify the count",
    properties: [propertyTypes.numberPositiveOrNegative],
    explanation: ([[number]]: Array<Array<number>>) => `Modify the channel count with ${number > 0 ? "+" : ""}${number}`,
    run: ({ countingChannel }, [[number]]: Array<Array<number>>) => {
      countingChannel.count.number += number;
      if (countingChannel.count.number < 0) countingChannel.count.number = 0;
      return Promise.resolve(true);
    },
  },
  setScore: {
    short: "Set the user's score",
    properties: [propertyTypes.numberPositiveOrZero],
    explanation: ([[number]]: Array<Array<number>>) => `Set the user's score to ${number}`,
    run: ({ member, countingChannel }, [[number]]: Array<Array<number>>) => {
      if (number > 0) countingChannel.scores.set(member.id, number);
      else return Promise.resolve(countingChannel.scores.delete(member.id));
      return Promise.resolve(true);
    },
    limit: 1,
  },
  modifyScore: {
    short: "Modify the user's score",
    properties: [propertyTypes.numberPositiveOrNegative],
    explanation: ([[number]]: Array<Array<number>>) => `Modify the user's score with ${number > 0 ? "+" : ""}${number}`,
    run: ({ member, countingChannel }, [[number]]: Array<Array<number>>) => {
      const newScore = (countingChannel.scores.get(member.id) || 0) + number;
      if (newScore > 0) countingChannel.scores.set(member.id, newScore);
      else return Promise.resolve(countingChannel.scores.delete(member.id));
      return Promise.resolve(true);
    },
  },
};

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default actions;
