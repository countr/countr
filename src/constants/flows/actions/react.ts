import { inspect } from "util";
import type { Action } from ".";
import countingLogger from "../../../utils/logger/counting";
import properties from "../../properties";

const react: Action<[string]> = {
  name: "Message reaction",
  description: "This will react to the counting message with an emoji. It also supports the `nodelete` module for failed counts.",
  properties: [properties.emoji],
  explanation: ([emoji]) => `React with ${emoji} to the counting message`,
  run: async ({ countingMessage }, [emoji]) => {
    await countingMessage.react(emoji).catch((err: unknown) => {
      countingLogger.error(`Failed to react to counting message ${countingMessage.id}, channel ${countingMessage.channel.id}, guild ${countingMessage.guild!.id}, member ${countingMessage.author.id}, with the emoji ${emoji}: ${inspect(err)}`);
    });
    return false;
  },
  limitPerFlow: 1,
};

export default react;
