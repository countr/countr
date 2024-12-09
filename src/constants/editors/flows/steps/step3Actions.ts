import type { Step } from ".";
import actions from "../../../flows/actions";
import { getTriggerOrActionComponents } from "../components";

const step: Step = {
  title: "Actions",
  description: [
    "Actions are what will happen when a trigger is met. You can set up multiple actions. If any of the actions fails, it will continue the flow.",
    "",
    "You can also have it trigger a random action when a trigger is met by enabling the \"Randomize action\" option on the last step.",
    "",
    "You can add and edit actions below!",
  ].join("\n"),
  fields: flow => flow.actions.map(({ type, data }, i) => {
    const action = actions[type];
    return { name: `• ${i + 1}: ${action.name}`, value: action.explanation(data as never) };
  }),
  components: (flow, userId) => getTriggerOrActionComponents("action", flow, userId),
  getStatus: flow => flow.actions.length ? "complete" : "incomplete",
};

export default { ...step } as Step;
