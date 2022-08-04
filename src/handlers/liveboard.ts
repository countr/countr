import type { Client, GuildTextBasedChannel, Snowflake } from "discord.js";
import config from "../config";
import { createLeaderboard } from "../constants/scores";
import { getGuildDocument } from "../database";
import { mainLogger } from "../utils/logger/main";

const unavailableLiveboards = new Set<Snowflake>();

export default function handleLiveboard(client: Client<true>): void {
  if (config.isPremium) {
    setInterval(() => void (async () => {
      const guilds = Array.from(client.guilds.cache.values());

      for (const guild of guilds) {
        const document = await getGuildDocument(guild.id);
        const countingChannels = Array.from(document.channels.entries());
        for (const [countingChannelId, countingChannel] of countingChannels) {
          if (countingChannel.liveboard) {
            const channel = client.channels.resolve(countingChannel.liveboard.channelId) as GuildTextBasedChannel | null;
            const message = await channel?.messages.fetch(countingChannel.liveboard.messageId).catch(() => null) ?? null;
            if (message) {
              await message.edit({
                embeds: [
                  {
                    author: {
                      name: `${guild.name} Scoreboard`,
                      icon_url: // eslint-disable-line camelcase
                          guild.iconURL({ size: 128 }) ??
                          guild.members.me?.avatarURL({ size: 128 }) ??
                          client.user.avatarURL({ size: 128 }) ??
                          "https://cdn.discordapp.com/embed/avatars/0.png",
                    },
                    description: createLeaderboard(Array.from(countingChannel.scores.entries())),
                    color: config.colors.primary,
                    timestamp: new Date().toISOString(),
                  },
                ],
              });
            } else if (unavailableLiveboards.has(countingChannelId)) {
              unavailableLiveboards.delete(countingChannelId);
              countingChannel.liveboard = null;
              mainLogger.verbose(`Liveboard for counting channel ${countingChannelId} is unavailable, I've removed it from the database.`);
            } else unavailableLiveboards.add(countingChannelId);
          }
        }
      }
    })(), 300_000);
  }
}
