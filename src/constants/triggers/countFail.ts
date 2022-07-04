import type { Trigger } from ".";

const countFail: Trigger<never> = {
  name: "Count fail",
  description: "This will get triggered whenever someone fails a count",
  supports: ["flows"],
  limitPerFlow: 1,
  explanation: () => "When someone fails to count the correct number",
};

export default countFail;
