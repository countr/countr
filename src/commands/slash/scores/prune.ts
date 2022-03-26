import type { SlashCommand } from "../../../@types/command";
import { msToTime } from "../../../utils/time";

const serversPruning = new Set<string>();

const sleepTime = 1500;

export default {
  description: "Prune scores from users that have left your server",
  execute: async (interaction, _, __, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel as string);
    if (!countingChannel) return;

    if (serversPruning.has(interaction.guild?.id as string)) {
      return interaction.reply({
        content: "❌ I'm already pruning scores from users that have left your server.",
        ephemeral: true,
      });
    }

    serversPruning.add(interaction.guild?.id as string);
    await interaction.reply({ content: "⏳ Loading...\n‼ We recommend locking the counting channel while this is running." });

    const list: Array<string> = [];
    const users = Array.from(countingChannel.scores.keys());

    let progress = 0;
    const progressInterval = setInterval(() => interaction.editReply({ content: `⏳ Pruning ... (${Math.round(progress / users.length * 100)}% done, ETA: ${msToTime((users.length - progress) * (sleepTime + interaction.client.ws.ping + 50))}, found ${list.length}, processed ${progress}, remaining ${users.length - progress})\n‼ We recommend locking the counting channel while this is running.` }), 5000);

    for (const user of users) {
      if (!await interaction.guild?.members.fetch({ user, cache: false }).catch(() => null)) list.push(user);
      await new Promise(resolve => { setTimeout(resolve, sleepTime); });
      progress += 1;
    }
    clearInterval(progressInterval);

    list.forEach(user => countingChannel.scores.delete(user));
    document.safeSave();

    serversPruning.delete(interaction.guild?.id as string);

    return interaction.reply({
      content: `✅ I have pruned ${list.length}/${users.length} scores from users that have left your server.`,
      ephemeral: true,
    });
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
