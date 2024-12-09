import type { Trigger } from ".";
import properties from "../properties";

const only: Trigger<[number]> = {
  name: "Only number X",
  description: "This will get triggered whenever a user counts the number X, and only the number X",
  properties: [properties.anyNumber],
  supports: ["flows", "notifications"],
  explanation: ([number]) => `When someone counts the number ${number}`,
  check: ({ count }, [number]) => count === number,
};

export default only;
