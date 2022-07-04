import { createModalTextInput, getModalTextInput, modals } from "../../../handlers/interactions/modals";
import type { PropertyInput } from ".";
import { TextInputStyle } from "discord.js";

const shortInput = (description: string, minLength = 1, maxLength = 1000): PropertyInput<string> => (interaction, currentValue) => new Promise(resolve => {
  void interaction.showModal({
    title: `Enter ${description}`,
    customId: `${interaction.id}:modalSubmit`,
    components: [
      createModalTextInput({
        style: TextInputStyle.Short,
        customId: "text",
        label: `Enter ${description} here`,
        minLength,
        maxLength,
        required: true,
        ...currentValue && { value: currentValue },
      }),
    ],
  });

  modals.set(`${interaction.id}:modalSubmit`, {
    callback(modalInteraction) {
      const text = getModalTextInput(modalInteraction.components, "text");
      if (!text) return resolve([null, modalInteraction]);
      return resolve([text, modalInteraction]);
    },
  });
});

export default shortInput;
