import { ButtonInteraction, SelectMenuInteraction } from "discord.js";

type ComponentInteractionCallback = (interaction: SelectMenuInteraction | ButtonInteraction) => Promise<void>;
interface ComponentInteractionDetails {
  allowedUsers: Array<string> | null,
  callback: ComponentInteractionCallback
}

export const components: Map<string, ComponentInteractionCallback | ComponentInteractionDetails> = new Map();

export default async (interaction: SelectMenuInteraction | ButtonInteraction): Promise<void> => {
  const detailsOrCallback = components.get(interaction.customId);
  if (detailsOrCallback) {
    const component: ComponentInteractionDetails = "callback" in detailsOrCallback ? detailsOrCallback : {
      allowedUsers: [ interaction.message.interaction?.user.id || "" ],
      callback: detailsOrCallback
    };
    if (component.allowedUsers && !component.allowedUsers.includes(interaction.user.id)) return console.log("hhhh"); // todo add error message
    component.callback(interaction);
  }
};