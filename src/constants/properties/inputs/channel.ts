import type { Snowflake } from "discord.js";
import { TextInputStyle } from "discord.js";
import { matchSorter } from "match-sorter";
import { createModalTextInput, getModalTextInput, modals } from "../../../handlers/interactions/modals";
import type { PropertyInput } from ".";

const channelInput: PropertyInput<Snowflake> = (interaction, currentValue) => new Promise(resolve => {
  // edit this to select menu whenever it comes out
  void interaction.showModal({
    title: "Search channel name or ID",
    customId: `${interaction.id}:modalSubmit`,
    components: [
      createModalTextInput({
        style: TextInputStyle.Short,
        customId: "query",
        label: "Write a channel name or ID here",
        minLength: 1,
        maxLength: 100,
        required: true,
        ...currentValue && { value: currentValue },
      }),
    ],
  });

  modals.set(`${interaction.id}:modalSubmit`, {
    callback(modalInteraction) {
      const query = getModalTextInput(modalInteraction.components, "query");
      const channel = query && (
        interaction.guild.channels.resolve(query) ||
        matchSorter(interaction.guild.channels.cache.map(({ name, id }) => ({ name, id })), query, { keys: ["name"] })[0]) ||
        null;
      return resolve([channel?.id ?? null, modalInteraction]);
    },
  });
});

export default channelInput;
