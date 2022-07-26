import { createModalTextInput, getModalTextInput, modals } from "../../../handlers/interactions/modals";
import type { PropertyInput } from ".";
import type { Snowflake } from "discord.js";
import { TextInputStyle } from "discord.js";
import { matchSorter } from "match-sorter";

const roleInput: PropertyInput<Snowflake[]> = (interaction, currentValue) => new Promise(resolve => {
  // edit this to select menu whenever it comes out
  void interaction.showModal({
    title: "Search role names or IDs",
    customId: `${interaction.id}:modalSubmit`,
    components: [
      createModalTextInput({
        style: TextInputStyle.Paragraph,
        customId: "query",
        label: "Separate multiple with new line",
        minLength: 1,
        required: true,
        ...currentValue?.length && { value: currentValue.join("\n") },
      }),
    ],
  });

  modals.set(`${interaction.id}:modalSubmit`, {
    callback(modalInteraction) {
      const query = String(getModalTextInput(modalInteraction.components, "query")).split("\n");
      const roles: Snowflake[] = [];
      for (const roleQuery of query) {
        const role = roleQuery && (
          interaction.guild.roles.resolve(roleQuery) ||
          matchSorter(interaction.guild.roles.cache.map(({ name, id }) => ({ name, id })), roleQuery, { keys: ["name"]})[0]
        ) || null;
        if (role) roles.push(role.id);
      }
      return resolve([roles.length ? roles : null, modalInteraction]);
    },
  });
});

export default roleInput;
