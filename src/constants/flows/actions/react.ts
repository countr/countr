import { inspect } from "util";
import countingLogger from "../../../utils/logger/counting";
import properties from "../../properties";
import type { Action } from ".";

const react: Action<[string]> = {
  name: "Message reaction",
  description: "React to the counting message with an emoji",
  properties: [properties.emoji],
  explanation: ([emoji]) => `React with ${emoji} to the counting message`,
  run: async ({ countingMessage }, [emoji]) => {
    await countingMessage.react(emoji).catch(err => {
      countingLogger.error(`Failed to react to counting message ${countingMessage.id}, channel ${countingMessage.channel.id}, guild ${countingMessage.guild!.id}, member ${countingMessage.author.id}, with the emoji ${emoji}: ${inspect(err)}`);
    });
    return false;
  },
  limitPerFlow: 1,
};

export default react;
