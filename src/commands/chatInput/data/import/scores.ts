import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "../..";
import { parseScores } from "../../../../utils/validation/scores";
import superagent from "superagent";

const command: ChatInputCommand = {
  description: "Import scores",
  options: [
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "score_file",
      description: "The score file to import",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const attachment = interaction.options.getAttachment("score_file", true);
    if (!attachment.url.endsWith(".json")) return void interaction.reply({ content: "❌ This is not a valid file type.", ephemeral: true });
    if (attachment.size > 2_000_000) return void interaction.reply({ content: "❌ This file is too large, maximum file size is 2MB. For scores, this is roughly 50,000 entries. If you have more than this then you need to split up the file yourself.", ephemeral: true });

    const request = superagent.get(attachment.url).then(res => res.text);

    return void Promise.all([request, interaction.deferReply({ ephemeral })]).then(([json]) => {
      const scores = parseScores(json);
      if (!scores) return void interaction.editReply("❌ This is not a valid score file.");

      const entries = Object.entries(scores);
      entries.forEach(([userId, newScore]) => {
        if (newScore) countingChannel.scores.set(userId, newScore);
        else countingChannel.scores.delete(userId);
      });
      document.safeSave();

      return void interaction.editReply(`✅ Imported scores of ${entries.length} members in <#${countingChannelId}>.`);
    });
  },
};

export default { ...command } as ChatInputCommand;
