import { ButtonInteraction, EmbedFieldData, InteractionButtonOptions, MessageSelectMenuOptions, SelectMenuInteraction } from "discord.js";
import { Flow } from "../../../database/models/Guild";

type ButtonComponentCallback = (interaction: ButtonInteraction) => Promise<void>;
type SelectMenuComponentCallback = (interaction: SelectMenuInteraction) => Promise<void>;

interface ButtonComponent {
  data: InteractionButtonOptions;
  callback: ButtonComponentCallback;
}

interface SelectMenuComponent {
  data: MessageSelectMenuOptions;
  callback: SelectMenuComponentCallback;
}

export type Component = ButtonComponent | SelectMenuComponent;
export type ComponentCallback = ButtonComponentCallback | SelectMenuComponentCallback;

export interface Step {
  title: string;
  description(flow: Flow): string;
  footers?(flow: Flow): Array<EmbedFieldData>;
  components?(flow: Flow): Array<Array<Component>>; // action row, components
  skipIfExists?: boolean;
}

const steps: Array<Step> = [
  {
    title: "Welcome to the flow editor!",
    description: () => "description here"
  }, // todo create more steps
];

export default steps;