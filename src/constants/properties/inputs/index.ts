import type { ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction } from "discord.js";
import channelInput from "./channel";
import paragraphInput from "./paragraph";
import rolesInput from "./roles";
import shortInput from "./short";

export type PropertyInput<Value> = (interaction: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached">, currentValue?: Value) => Promise<[newValue: Value | null, interaction: ButtonInteraction<"cached"> | ModalSubmitInteraction<"cached"> | SelectMenuInteraction<"cached">]>;

export { channelInput, paragraphInput, rolesInput, shortInput };
