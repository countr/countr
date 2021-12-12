import { release, type } from "os";
import { ManagerStatus } from "../../types/manager";
import { SlashCommand } from "../../types/command";
import { bytesToHumanReadableFormat } from "../../utils/human";
import config from "../../config";
import { getManagerStats } from "../../utils/cluster/stats";
import { msToTime } from "../../utils/time";
import { trim } from "../../utils/text";
import { version } from "discord.js";

const info: {
  manager?: ManagerStatus | Promise<ManagerStatus>;
  platform: string;
  djsVersion: string;
  memory: number;
} = {
  platform: `${type()} (${trim(release(), 20)})`,
  djsVersion: version,
  memory: process.memoryUsage().heapUsed,
};

export default {
  description: "Get information about Countr",
  execute: async (interaction, ephemeral) => {
    if (!info.manager) {
      info.manager = getManagerStats(interaction.client);
      info.memory = process.memoryUsage().heapUsed;
      setTimeout(() => delete info.manager, 30000); // reset after 30s
    }

    const manager = info.manager instanceof Promise ? await info.manager : info.manager;

    const shardId = interaction.guild?.shardId;
    const guildsOnShard = interaction.client.guilds.cache.filter(g => g.shardId === shardId);

    interaction.reply({
      embeds: [
        {
          title: `Bot Information - ${interaction.client.user?.tag}`,
          description: "Countr is an advanced counting bot which can manage a counting channel in your guild. With a simple setup, your channel is ready.",
          fields: [
          // max 5 lines each
            {
              name: "💠 Host",
              value: [
                `**OS:** \`${info.platform}\``,
                `**Library:** \`discord.js^${info.djsVersion}\``,
                `**Clusters:** \`${manager.clusters.length}\``,
                `**Shards:** \`${manager.clusters.map(c => c.cluster.shards.length).reduce((a, b) => a + b, 0)}/${config.cluster.shardCount}\``,
                `**Memory:** \`${bytesToHumanReadableFormat(manager.totalMemory)}\``,
              ].join("\n"),
              inline: true,
            },
            {
              name: `🔷 Cluster (${config.cluster.id})`, // "shards", "library", "memory usage", "uptime"
              value: [
                `**Shards:** \`${config.cluster.shards.length}\``,
                `**Guilds:** \`${interaction.client.guilds.cache.size}\``,
                `**Users:** \`${interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\``,
                `**Memory:** \`${bytesToHumanReadableFormat(info.memory)}\``,
                `**Uptime:** \`${msToTime(process.uptime() * 1000)}\``,
              ].join("\n"),
              inline: true,
            },
            {
              name: `🌀 Shard (${shardId})`,
              value: [
                `**Guilds:** \`${guildsOnShard.size}\``,
                `**Users:** \`${guildsOnShard.reduce((a, b) => a + b.memberCount, 0)}\``,
                `**Socket Ping:** \`${interaction.client.ws.shards.find(ws => ws.id === shardId)?.ping}ms\``,
              ].join("\n"),
              inline: true,
            },
            // max 3 lines each
            {
              name: "🔗 Links",
              value: [
                `**Invite me:** [https://discord.com/api/oauth2/authorize?...](https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user?.id}&permissions=805334032&scope=bot%20applications.commands)`,
                "**Support Server**: https://promise.solutions/support",
                "**Website**: https://countr.xyz",
              ].join("\n"),
              inline: true,
            },
            {
              name: "🎰 Global Stats", // "guilds", "users", "weekly count"
              value: [
                `**Weekly Count:** \`${manager.weeklyCount}\``,
                `**Total Guilds:** \`${manager.totalGuilds}\``,
                `**Total Users:** \`${manager.totalUsers}\``,
              ].join("\n"),
              inline: true,
            },
          ],
          color: config.colors.primary,
        },
      ],
      ephemeral,
    });
  },
} as SlashCommand;
