import type { Trigger } from ".";
import properties from "../properties";

const greater: Trigger<[number]> = {
  name: "Greater than or equal to number X",
  description: "This will get triggered whenever a user counts a number that is greater than or equal to the number X.",
  properties: [properties.anyNumber],
  supports: ["flows", "notifications"],
  explanation: ([number]) => `When someone counts a number greater than or equal to ${number}, for example ${number}, ${number + 1}, ${number + 2} and so on`,
  check: ({ count }, [number]) => count >= number,
};

export default greater;
