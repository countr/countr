import type { Trigger } from ".";

const timeout: Trigger<never> = {
  name: "Timeout role triggered",
  description: "This will get triggered whenever someone gets the timeout role.",
  supports: ["flows"],
  limitPerFlow: 1,
  explanation: () => "When someone gets the timeout role",
};

export default timeout;
