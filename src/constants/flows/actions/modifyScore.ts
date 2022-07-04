import type { Action } from ".";
import properties from "../../properties";

const modifyScore: Action<[number]> = {
  name: "Modify the user's score",
  properties: [properties.numberPositiveOrNegative],
  explanation: ([number]) => `Modify the user's score with ${number > 0 ? "+" : ""}${number}`,
  run: ({ member, countingChannel }, [number]) => {
    const newScore = (countingChannel.scores.get(member.id) ?? 0) + number;
    if (newScore <= 0) return countingChannel.scores.delete(member.id);
    countingChannel.scores.set(member.id, newScore);
    return true;
  },
};

export default modifyScore;
