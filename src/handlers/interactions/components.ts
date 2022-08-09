import type { Awaitable, ButtonInteraction, SelectMenuInteraction, Snowflake } from "discord.js";
import { commandsLogger } from "../../utils/logger/commands";

interface SelectMenuComponentDetails {
  type: "SELECT_MENU";
  callback(interaction: SelectMenuInteraction<"cached">): Awaitable<void>;
}

interface ButtonComponentDetails {
  type: "BUTTON";
  callback(interaction: ButtonInteraction<"cached">): Awaitable<void>;
}

type ComponentInteractionDetails = {
  allowedUsers: "all" | [Snowflake, ...Snowflake[]];
  garbageCollect?: Date | false;
} & (ButtonComponentDetails | SelectMenuComponentDetails);

export const components = new Map<string, ComponentInteractionDetails>();

export default function componentHandler(interaction: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached">): void {
  const component = components.get(interaction.customId);
  if (!component) return void commandsLogger.debug(`Component interaction ${interaction.customId} not found`);

  if (component.allowedUsers !== "all" && !component.allowedUsers.includes(interaction.user.id)) return;
  void component.callback(interaction as never);
}

const pendingGarbage = new Map<string, Date>();
if (process.env["NODE_ENV"] !== "test") {
  setInterval(() => {
    const now = new Date();
    pendingGarbage.forEach((date, key) => {
      if (now < date) return;

      components.delete(key);
      pendingGarbage.delete(key);
    });

    components.forEach(({ garbageCollect }, key) => {
      if (garbageCollect === false || pendingGarbage.has(key)) return;

      const date = garbageCollect ?? new Date(now.getTime() + 3600000);
      pendingGarbage.set(key, date);
    });
  }, 300000);
}
