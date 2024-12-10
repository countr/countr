import type{ MessageEditOptions, MessageReplyOptions } from "discord.js";
import SapphireType from "@sapphire/type";
import { randomBytes } from "crypto";
import dedent from "dedent";
import { blockQuote, ButtonStyle, codeBlock, ComponentType, inlineCode } from "discord.js";
import { inspect } from "util";
import { isPromise } from "util/types";
import type{ MentionCommand } from ".";
import config from "../../config";
import { DebugCommandLevel } from "../../constants/permissions";
import { buttonComponents } from "../../handlers/interactions/components";

const command: MentionCommand = {
  debugLevel: DebugCommandLevel.Owner,
  testArgs(args) { return args.length > 0; },
  // eslint-disable-next-line id-length, @typescript-eslint/no-unused-expressions, @stylistic/ts/brace-style -- the dollar sign is the message, we need this for context in the eval function
  execute($, reply, args) { $;
    try {
      // eslint-disable-next-line no-eval, @typescript-eslint/no-unsafe-assignment
      const evaluated = eval(args.join(" "));
      if (isPromise(evaluated)) {
        const now = new Date();
        const message = reply({
          ...generateResponse(evaluated),
          content: "💨 Running...",
        });
        return evaluated
          .then(async result => {
            const ms = new Date().getTime() - now.getTime();
            return (await message).edit(generateFinalResponse(result, ms));
          })
          .catch(async (err: unknown) => {
            const ms = new Date().getTime() - now.getTime();
            return (await message).edit(generateFinalResponse(err, ms, false));
          });
      }
      return reply(generateFinalResponse(evaluated));
    } catch (err) {
      return reply(generateFinalResponse(err, -1, false));
    }
  },
};

export default { ...command } as MentionCommand;

function generateFinalResponse(result: unknown, ms = -1, success = true, fileUpload = false): MessageEditOptions & MessageReplyOptions {
  const identifier = randomBytes(16).toString("hex");
  buttonComponents.set(`${identifier}:upload-to-file`, {
    allowedUsers: [config.owner],
    callback(button) {
      void button.update(generateFinalResponse(result, ms, success, true));
    },
  });

  return {
    components: [],
    embeds: [],
    ...generateResponse(result, ms, success, !fileUpload),
    ...fileUpload ?
      {
        files: [
          {
            name: "output.ts",
            attachment: Buffer.from(dedent`
              // type: ${new SapphireType(result).toString()}
              // time: ${ms === -1 ? "n/a" : `${ms}ms`}
              // success: ${success ? "yes" : "no"}\n
            ` + inspect(result, { depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity })),
          },
        ],
      } :
      {
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                label: "Upload to file",
                style: ButtonStyle.Primary,
                customId: `${identifier}:upload-to-file`,
              },
            ],
          },
        ],
      },
  };
}

function generateResponse(result: unknown, ms = -1, success = true, includeResult = true, depth = 10, maxArrayLength = 100): MessageEditOptions & MessageReplyOptions {
  if (depth <= 0) return { content: "⚠️ Output is too big to display" };
  const output = inspect(result, { colors: true, depth, maxArrayLength });
  const type = new SapphireType(result).toString();
  const content = `${success ? "✅ Evaluated successfully" : "❌ Javascript failed"}. ${ms === -1 ? "" : `(${inlineCode(`${ms}ms`)})`}\n${includeResult ? blockQuote(codeBlock("ts", ms === -1 ? type : `Promise<${type}>`) + codeBlock("ansi", success ? output : output.split("\n")[0]!)) : ""}`;

  // 1024 is not the actual limit but any bigger than 1k is really not ideal either way
  if (content.length > 1024) {
    if (!maxArrayLength) return generateResponse(result, ms, success, includeResult, depth - 1, maxArrayLength);
    return generateResponse(result, ms, success, includeResult, depth, maxArrayLength - 1);
  }

  return { content };
}
