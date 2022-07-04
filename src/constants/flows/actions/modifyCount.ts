import type { Action } from ".";
import properties from "../../properties";

const modifyCount: Action<[number]> = {
  name: "Modify the count",
  properties: [properties.numberPositiveOrNegative],
  explanation: ([number]) => `Modify the channel count with ${number > 0 ? "+" : ""}${number}`,
  run: ({ countingChannel }, [number]) => {
    countingChannel.count.number += number;
    if (countingChannel.count.number < 0) countingChannel.count.number = 0;
    return true;
  },
};

export default modifyCount;
