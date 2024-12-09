import type { Snowflake } from "discord.js";
import { ComponentType } from "discord.js";
import type { PropertyInput } from ".";
import { selectMenuComponents } from "../../../handlers/interactions/components";

const roleInput: PropertyInput<Snowflake[]> = interaction => new Promise(resolve => {
  void interaction.update({
    content: "🔻 What roles would you like to use?",
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.RoleSelect,
            customId: `${interaction.id}:select`,
            placeholder: "Select roles",
            minValues: 1,
            maxValues: 10,
          },
        ],
      },
    ],
  });

  selectMenuComponents.set(`${interaction.id}:select`, {
    selectType: "role",
    allowedUsers: [interaction.user.id],
    callback(selectInteraction) {
      const roleIds = selectInteraction.values;
      return resolve([roleIds.length ? roleIds : null, selectInteraction]);
    },
  });
});

export default roleInput;
