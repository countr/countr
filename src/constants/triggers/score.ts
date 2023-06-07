import properties from "../properties";
import type { Trigger } from ".";

const score: Trigger<[number]> = {
  name: "Score of X",
  description: "This will get triggered whenever a user has counted a total of X counts.",
  properties: [properties.numberPositive],
  supports: ["flows"],
  explanation: ([number]) => `When someone counts a total of ${number} counts`,
  check: ({ countingChannel: { scores }, member }, [number]) => scores.get(member.id) === number,
};

export default score;
