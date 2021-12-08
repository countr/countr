import { ButtonInteraction, SelectMenuInteraction } from "discord.js";

type ComponentInteractionCallback = (interaction: SelectMenuInteraction | ButtonInteraction) => void;
interface ComponentInteractionDetails {
  allowedUsers: Array<string> | null,
  callback: ComponentInteractionCallback
}

export const components: Map<string, ComponentInteractionCallback | ComponentInteractionDetails> = new Map();

export default (interaction: SelectMenuInteraction | ButtonInteraction): void => {
  const detailsOrCallback = components.get(interaction.customId);
  if (detailsOrCallback) {
    const component: ComponentInteractionDetails = "callback" in detailsOrCallback ?
      detailsOrCallback :
      {
        allowedUsers: [interaction.message.interaction?.user.id || ""],
        callback: detailsOrCallback,
      };
    if (component.allowedUsers && !component.allowedUsers.includes(interaction.user.id)) return console.log("hhhh"); // todo add error message
    component.callback(interaction);
  }
};


/*
 * remove map entries that has been there longer than an hour, to avoid indefinite growth and memory leaks.
 * it would be more optimized to add the timestamp in the map entry itself, but this is easier code-wise as
 * we just need to do `components.set("key", () => ...)` instead of, for example, doing something like
 * `components.set("key", { timestamp: Date.now(), callback: () => ... })` in the code. it'll just be messy.
 */

const timeUntilGarbage = new Map<string, number>();

setInterval(() => {
  components.forEach((_, key) => {
    if (!timeUntilGarbage.has(key) && !key.includes("_")) timeUntilGarbage.set(key, Date.now() + 3600000);
  });

  timeUntilGarbage.forEach((value, key) => {
    if (value < Date.now()) {
      components.delete(key);
      timeUntilGarbage.delete(key);
    }
  });
}, 300000);
