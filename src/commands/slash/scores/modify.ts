import type { SlashCommand } from "..";

export default {
  description: "Modify a user's score",
  options: [
    {
      type: "USER",
      name: "user",
      description: "The user to modify the score of",
      required: true,
    },
    {
      type: "STRING",
      name: "method",
      description: "The method to use to modify the score",
      required: true,
      choices: [
        { value: "+", name: "Add to the score" },
        { value: "-", name: "Subtract from the score" },
        { value: "=", name: "Set the score" },
      ],
    },
    {
      type: "INTEGER",
      name: "amount",
      description: "The amount",
      required: true,
    },
  ],
  execute: (interaction, ephemeralPreference, { user, method, amount }: { user: string; method: "+" | "-" | "="; amount: number; }, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel);
    if (!countingChannel) return;

    const currentScore = countingChannel.scores.get(user) || 0;
    const newScore = method === "+" ? currentScore + amount : method === "-" ? currentScore - amount : amount;
    if (newScore === 0) countingChannel.scores.delete(user);
    else countingChannel.scores.set(user, newScore);
    document.safeSave();

    return interaction.reply({
      content: `✅ ${user}'s score is now set from ${currentScore} ${newScore}.`,
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
