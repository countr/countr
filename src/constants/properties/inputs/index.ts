import type { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import channelInput from "./channel";
import paragraphInput from "./paragraph";
import rolesInput from "./roles";
import shortInput from "./short";

export type PropertyInput<Value> = (interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached">, currentValue?: Value) => Promise<[newValue: null | Value, interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached"> | ModalSubmitInteraction<"cached">]>;

export { channelInput, paragraphInput, rolesInput, shortInput };
