import { version as djsVersion } from "discord.js";
import { release, type } from "os";
import type { ChatInputCommand } from ".";
import config from "../../config";
import { homepage, premiumHelpUrl, supportServerUrl } from "../../constants/links";
import { getAllStats } from "../../utils/cluster";
import { bytesToHumanReadable } from "../../utils/human";
import { fitText } from "../../utils/text";
import { msToHumanShortTime } from "../../utils/time";

const platform = `${type()} ${fitText(release(), 20)}`;

const command: ChatInputCommand = {
  description: "Get information about Countr",
  execute(interaction, ephemeral) {
    const allStats = getAllStats();
    if (!allStats) return void interaction.reply({ content: "❌ Stats is currently unavailable for this cluster, please try again later.", ephemeral: true });

    const { shardId } = interaction.guild;
    const thisShard = allStats.shards[String(shardId)]!;
    const thisCluster = allStats.clusters[String(config.cluster.id)]!;

    const allClusters = Object.values(allStats.clusters);

    return void interaction.reply({
      embeds: [
        {
          title: `Bot Information - @${interaction.client.user.username}`,
          description: "Countr is an advanced counting bot which can manage a counting channel in your guild. With a simple setup, your channel is ready.",
          fields: [
            // max 5 lines each
            {
              name: "💠 Host",
              value: [
                `**OS:** \`${platform}\``,
                `**Library:** \`discord.js^${fitText(djsVersion, "xx.x.x-dev".length, false)}\``,
                `**Clusters:** \`${allClusters.length.toLocaleString()}\``,
                `**Shards:** \`${allClusters.reduce((a, b) => a + b.clusterShards.length, 0).toLocaleString()}/${config.cluster.shardCount.toLocaleString()}\``,
                `**Memory:** \`${bytesToHumanReadable(allClusters.reduce((a, b) => a + b.clusterMemory, 0))}\``,
              ].join("\n"),
              inline: true,
            },
            {
              name: `🔷 Cluster #${config.cluster.id}`,
              value: [
                `**Shards:** \`${config.cluster.shards.length.toLocaleString()}\``,
                `**Guilds:** \`${interaction.client.guilds.cache.size.toLocaleString()}\``,
                `**Users:** \`${interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}\``,
                `**Memory:** \`${bytesToHumanReadable(thisCluster.clusterMemory)}\``,
                `**Uptime:** \`${msToHumanShortTime(process.uptime() * 1000)}\``,
              ].join("\n"),
              inline: true,
            },
            {
              name: `🌀 Shard #${shardId}`,
              value: [
                `**Guilds:** \`${thisShard.guilds.toLocaleString()}\``,
                `**Users:** \`${thisShard.users.toLocaleString()}\``,
                `**Socket Ping:** \`${thisShard.ping}ms\``,
              ].join("\n"),
              inline: true,
            },
            // max 3 lines each
            {
              name: "🔗 Links",
              value: [
                config.isPremium ? `[**See what Premium offers!**](${premiumHelpUrl})` : `[**Invite me to your server!**](https://discord.com/application-directory/${interaction.client.user.id})`,
                `**Support**: ${supportServerUrl}`,
                `**Website**: ${homepage}`,
              ].join("\n"),
              inline: true,
            },
            {
              name: "🎰 Global Stats",
              value: [
                `**Weekly Count:** \`${allStats.weeklyCount.toLocaleString()}\``,
                `**Total Guilds:** \`${allClusters.reduce((a, b) => a + b.clusterShards.reduce((total, shard) => total + (allStats.shards[String(shard)]?.guilds ?? 0), 0), 0).toLocaleString()}\``,
                `**Total Users:** \`${allClusters.reduce((a, b) => a + b.clusterShards.reduce((total, shard) => total + (allStats.shards[String(shard)]?.users ?? 0), 0), 0).toLocaleString()}\``,
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
};

export default { ...command } as ChatInputCommand;
