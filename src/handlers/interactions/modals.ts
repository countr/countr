import type { ActionRowData, Awaitable, ModalSubmitInteraction, TextInputComponentData, TextInputModalData } from "discord.js";
import { ComponentType } from "discord.js";
import commandsLogger from "../../utils/logger/commands";

interface ModalInteractionDetails {
  garbageCollect?: Date | false;
  callback(interaction: ModalSubmitInteraction<"cached">): Awaitable<void>;
}

export const modals = new Map<string, ModalInteractionDetails>();

export default function modalHandler(interaction: ModalSubmitInteraction<"cached">): void {
  const modal = modals.get(interaction.customId);
  if (!modal) return void commandsLogger.debug(`Modal interaction ${interaction.customId} not found for interaction ${interaction.id}, channel ${interaction.channelId ?? "null"}, guild ${interaction.guildId}`);

  void modal.callback(interaction);
}

const pendingGarbage = new Map<string, Date>();
if (process.env["NODE_ENV"] !== "test") {
  setInterval(() => {
    const now = new Date();
    pendingGarbage.forEach((date, key) => {
      if (now < date) return;

      modals.delete(key);
      pendingGarbage.delete(key);
    });

    modals.forEach(({ garbageCollect }, key) => {
      if (garbageCollect === false || pendingGarbage.has(key)) return;

      const date = garbageCollect ?? new Date(now.getTime() + 3600000);
      pendingGarbage.set(key, date);
    });
  }, 300000);
}

export function getModalTextInput(actionRows: ModalSubmitInteraction["components"], customId: string): string | null {
  const actionRow = actionRows.find(row => row.components.some(component => component.type === ComponentType.TextInput && component.customId === customId));
  if (!actionRow) return null;

  const textInput = actionRow.components.find(component => component.type === ComponentType.TextInput && component.customId === customId);
  if (!textInput) return null;

  return (textInput as TextInputModalData).value;
}

export function createModalTextInput(options: Omit<TextInputComponentData, "type">): ActionRowData<TextInputComponentData> {
  return {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.TextInput,
        ...options,
      },
    ],
  };
}
