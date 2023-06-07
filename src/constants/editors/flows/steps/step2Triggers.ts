import triggers from "../../../triggers";
import { getTriggerOrActionComponents } from "../components";
import type { Step } from ".";

const step: Step = {
  title: "Triggers",
  description: [
    "Triggers are the conditions that will trigger your flow. You can set up multiple triggers. Keep in mind that if any trigger's condition is met, all actions will run.",
    "",
    "You can add and edit triggers below!",
  ].join("\n"),
  fields: flow => flow.triggers.map(({ type, data }, i) => {
    const trigger = triggers[type];
    return { name: `• ${i + 1}: ${trigger.name}`, value: trigger.explanation(data as never) };
  }),
  components: (flow, userId) => getTriggerOrActionComponents("trigger", flow, userId),
  getStatus: flow => flow.triggers.length ? "complete" : "incomplete",
};

export default { ...step } as Step;
