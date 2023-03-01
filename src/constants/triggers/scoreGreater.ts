import properties from "../properties";
import type { Trigger } from ".";

const scoreGreater: Trigger<[number]> = {
  name: "Score greater than or equal to X",
  description: "This will get triggered whenever a user has counted a total of X counts, or more than X counts.",
  properties: [properties.numberPositive],
  supports: ["flows"],
  explanation: ([number]) => `When someone counts a total of ${number} counts or more, aka. it will also trigger when they reach a score of ${number + 1} and ${number + 2} etc.`,
  check: ({ countingChannel: { scores }, member }, [number]) => (scores.get(member.id) ?? 0) >= number,
};

export default scoreGreater;
