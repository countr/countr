import * as guilds from "../database/guilds";
import type { Client } from "discord.js";
import config from "../config";
import { formatScore } from "../constants/scores";

export default (client: Client) => Promise.all(client.guilds.cache.map(async guild => {
  const gdb = await guilds.get(guild.id), channels = Array.from(gdb.channels).filter(channel => channel[1].liveboard);
  for (const [, { liveboard, scores }] of channels) {
    const channel = client.channels.resolve(liveboard?.channelId as string);
    if (!channel || !channel.isText() || !liveboard) return;

    const message = await channel.messages.fetch(liveboard.messageId).catch(() => null);
    if (!message) return;

    const
      sorted = Array.from(scores).sort((a, b) => b[1] - a[1]),
      top = sorted.slice(0, 25),
      leaderboard = top.map(([userId, score], index) => formatScore(userId, score, index)),
      description = leaderboard.join("\n");

    message.edit({
      content: null,
      embeds: [
        {
          author: {
            name: `${guild.name} Scoreboard`,
            iconURL:
              guild.iconURL({ dynamic: true, size: 128 }) || // guild icon
              client.user?.avatarURL({ dynamic: true, size: 128 }) || // client avatar
              `${client.options.http?.cdn || "https://cdn.discordapp.com"}/embed/avatars/0.png`, // fallback default discord avatar
          },
          description,
          color: config.colors.primary,
          timestamp: Date.now(),
        },
      ],
    });
  }
}));
