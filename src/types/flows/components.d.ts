import { ButtonInteraction, InteractionButtonOptions, InteractionReplyOptions, MessageSelectMenuOptions, SelectMenuInteraction } from "discord.js";
import { Flow } from "../../database/models/Guild";

type ButtonComponentCallback = (interaction: ButtonInteraction, flow: Flow, designNewMessage: () => InteractionReplyOptions) => Promise<void>;
type SelectMenuComponentCallback = (interaction: SelectMenuInteraction, flow: Flow, designNewMessage: () => InteractionReplyOptions) => Promise<void>;

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
