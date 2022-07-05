import { flowHelpUrl, supportServerUrl } from "../../../links";
import type { Step } from ".";

const step: Step = {
  title: "Welcome to the flow editor!",
  description: [
    "I will guide you through creating a flow. It is very easy to set one up, and you can customize flows a lot as well!",
    "",
    "Here's some things to note:",
    "• **Any trigger** will run **all actions**. So if you want to give out role rewards, you need to set up a flow per reward.",
    "• Actions run **asynchronously**, meaning that your first action will run, and then your second, and then your third etc.",
    "• If an action fails, it will just continue on to the next action.",
    "",
    `Click the buttons below to navigate. Need help? Check out the [documentation](${flowHelpUrl}) or ask a question in the [support server](${supportServerUrl}). Have feedback? Join the support server, we would love to hear from you!`,
  ].join("\n"),
  skipIfExists: true,
  getStatus: () => "complete",
};

export default { ...step } as Step;
