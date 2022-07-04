import type { Action } from ".";
import properties from "../../properties";

const setScore: Action<[number]> = {
  name: "Set the user's score",
  properties: [properties.numberPositiveOrZero],
  explanation: ([number]) => `Set the user's score to ${number}`,
  run: ({ member, countingChannel }, [number]) => {
    if (number <= 0) return countingChannel.scores.delete(member.id);
    countingChannel.scores.set(member.id, number);
    return true;
  },
  limit: 1,
};

export default setScore;
