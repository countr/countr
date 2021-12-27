import { NewsChannel, TextChannel } from "discord.js";
import { Action } from "../../types/flows/actions";
import { joinListWithAnd } from "../../utils/text";
import { propertyTypes } from "./properties";

const actions: Record<string, Action> = {
  giverole: {
    short: "Give a role (or list of roles) to the user",
    long: "This will add a role, or a list of roles, to the user who triggered this flow.",
    properties: [propertyTypes.role],
    explanation: ([roles]) => `Add the user to ${roles.length === 1 ? "role" : "roles"} ${joinListWithAnd(roles.map(role => `<@&${role}>`))}`,
    run: async ({ message: { member }}, [roleIds]: Array<Array<string>>) => {
      await member?.roles.add(roleIds).catch(() => null);
      return false;
    },
    limit: 1,
  },
  takerole: {
    short: "Remove a role (or list of roles) from the user",
    long: "This will remove a role, or a list of roles, from the user who triggered this flow.",
    properties: [propertyTypes.role],
    explanation: ([roles]) => `Remove the user from ${roles.length === 1 ? "role" : "roles"} ${joinListWithAnd(roles.map(role => `<@&${role}>`))}`,
    run: async ({ message: { member }}, [roleIds]: Array<Array<string>>) => {
      await member?.roles.remove(roleIds).catch(() => null);
      return false;
    },
    limit: 1,
  },
  prunerole: {
    short: "Remove everyone from a role (or list of roles)",
    long: "This will remove everyone from a role, or a list of roles.\nNote: This might not remove everyone from the role(s). This is due to caching. [Read more](https://docs.countr.xyz/#/caching)", // todo
    properties: [propertyTypes.role],
    explanation: ([roles]) => `Remove everyone from ${roles.length === 1 ? "role" : "roles"} ${joinListWithAnd(roles.map(role => `<@&${role}>`))}`,
    run: async ({ message: { guild }}, [[roleId]]: Array<Array<string>>) => { // todo support multiple roles
      const role = guild?.roles.resolve(roleId);
      if (role) await Promise.all(role.members.map(member => member.roles.remove(roleId).catch()));
      return false;
    },
    limit: 1,
  },
  pin: {
    short: "Pin the count message",
    explanation: () => "Pin the count",
    run: async ({ countingMessageId, message }) => {
      const countingMessage = await message.channel.messages.fetch(countingMessageId);
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
  sendmessage: {
    short: "Send a message",
    long: "This will send a message in any channel you'd like",
    properties: [propertyTypes.channel, propertyTypes.text],
    explanation: ([[channel], [text]]: Array<Array<string>>) => `Send a message in <#${channel}>: \`\`\`${text}\`\`\``,
    run: async ({ count, message: { guild, member, author, content }, score }, [[channelId], [text]]: Array<Array<string>>) => {
      const channel = guild?.channels.resolve(channelId);
      if (channel && channel.isText()) {
        await channel.send({
          content: text
            .replace(/{count}/gi, count.toString())
            .replace(/{mention}/gi, author.toString())
            .replace(/{tag}/gi, author.tag)
            .replace(/{username}/gi, author.username)
            .replace(/{nickname}/gi, member?.displayName || author.username)
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
    long: "This will lock the counting channel for the everyone-role",
    explanation: () => "Lock the counting channel",
    run: async ({ message: { channel, guild }}) => {
      if (guild && (channel instanceof TextChannel || channel instanceof NewsChannel)) await channel.permissionOverwrites.edit(guild.roles.everyone, { SEND_MESSAGES: false });
      return false;
    },
    limit: 1,
  },
  reset: {
    short: "Reset the count",
    explanation: () => "Reset the count to 0",
    run: ({ message: { channel }, document }) => {
      const dbChannel = document.channels.get(channel.id);
      if (dbChannel) {
        dbChannel.count = { number: 0 };
        return Promise.resolve(true);
      } return Promise.resolve(false);
    },
    limit: 1,
  },
};

export default actions;
