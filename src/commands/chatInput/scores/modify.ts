import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";

const command: ChatInputCommand = {
  description: "Modify a user's score",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "The user to modify the score of",
      required: true,
    }, {
      type: ApplicationCommandOptionType.String,
      name: "method",
      description: "The method to use to modify the score",
      required: true,
      choices: [
        { value: "+", name: "Add to the score" },
        { value: "-", name: "Subtract from the score" },
        { value: "=", name: "Set the score" },
      ],
    }, {
      type: ApplicationCommandOptionType.Integer,
      name: "amount",
      description: "The amount to modify the score by",
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const user = interaction.options.getUser("user", true);
    const method = interaction.options.getString("method", true) as "-" | "+" | "=";
    const amount = interaction.options.getInteger("amount", true);

    const currentScore = countingChannel.scores.get(user.id) ?? 0;
    let newScore = currentScore;
    switch (method) {
      case "+":
        newScore += amount;
        break;
      case "-":
        newScore -= amount;
        break;
      case "=":
        newScore = amount;
        break;
      default: break;
    }
    if (newScore <= 0) countingChannel.scores.delete(user.id);
    else countingChannel.scores.set(user.id, newScore);
    document.safeSave();

    return void interaction.reply({ content: `✅ ${user.toString()}'s score in <#${countingChannelId}> is now ${newScore}.`, ephemeral });
  },
};

export default { ...command } as ChatInputCommand;
