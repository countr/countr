import type { Snowflake } from "discord.js";
import { escapeCodeBlock } from "discord.js";
import properties from "../../properties";
import type { Action } from ".";

const sendMessage: Action<[Snowflake, string]> = {
  name: "Send a message",
  description: "This will send a message in any channel you'd like",
  properties: [properties.channel, properties.text],
  explanation: ([channel, text]) => `Send a message in <#${channel}>: \`\`\`${escapeCodeBlock(text)}\`\`\``,
  run: async ({ count, member, message: { guild, content }, countingChannel: { scores } }, [channelId, text]) => {
    const channel = guild.channels.resolve(channelId);
    if (channel?.isTextBased()) {
      await channel.send({
        content: text
          .replace(/\{count\}/giu, count.toString())
          .replace(/\{mention\}/giu, member.user.toString())
          .replace(/\{tag\}/giu, member.user.tag)
          .replace(/\{username\}/giu, member.user.username)
          .replace(/\{nickname\}/giu, member.displayName || member.user.username)
          .replace(/\{everyone\}/giu, guild.roles.everyone.toString())
          .replace(/\{score\}/giu, String(scores.get(member.id) ?? 0))
          .replace(/\{content\}/giu, content),
        allowedMentions: { parse: ["everyone", "users", "roles"] },
      }).catch();
    }
    return false;
  },
};

export default sendMessage;
