import type { Snowflake } from "discord.js";
import { ComponentType } from "discord.js";
import type { PropertyInput } from ".";
import { selectMenuComponents } from "../../../handlers/interactions/components";
import { textBasedChannelTypes } from "../../discord";

const channelInput: PropertyInput<Snowflake> = interaction => new Promise(resolve => {
  void interaction.update({
    content: "🔻 What channel would you like to use?",
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.ChannelSelect,
            customId: `${interaction.id}:select`,
            placeholder: "Select a channel",
            channelTypes: [...textBasedChannelTypes],
            minValues: 1,
            maxValues: 1,
          },
        ],
      },
    ],
  });

  selectMenuComponents.set(`${interaction.id}:select`, {
    selectType: "channel",
    allowedUsers: [interaction.user.id],
    callback(selectInteraction) {
      const [channelId] = selectInteraction.values as [Snowflake];
      return resolve([channelId || null, selectInteraction]);
    },
  });
});

export default channelInput;
