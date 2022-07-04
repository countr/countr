import type { Action } from ".";
import properties from "../../properties";

const setCount: Action<[number]> = {
  name: "Set the count",
  properties: [properties.numberPositiveOrZero],
  explanation: ([number]) => `Set the channel count to ${number}`,
  run: ({ countingChannel }, [number]) => {
    countingChannel.count.number = number > 0 ? number : 0;
    return true;
  },
  limit: 1,
};

export default setCount;
