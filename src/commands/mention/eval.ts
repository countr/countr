import type { MessageEditOptions, MessageReplyOptions } from "discord.js";
import { randomBytes } from "crypto";
import { ButtonStyle, ComponentType } from "discord.js";
import superagent from "superagent";
import { inspect } from "util";
import type { MentionCommand } from ".";
import config from "../../config";
import { charactersPerMessage } from "../../constants/discord";
import { DebugCommandLevel } from "../../constants/permissions";
import { buttonComponents } from "../../handlers/interactions/components";

const command: MentionCommand = {
  debugLevel: DebugCommandLevel.Owner,
  testArgs(args) { return args.length !== 0; },
  execute(_, reply, args) {
    try {
      // eslint-disable-next-line no-eval, @typescript-eslint/no-unsafe-assignment
      const evaluated = eval(args.join(" "));
      if (evaluated instanceof Promise) {
        const botMsg = reply("💨 Running...");
        const start = Date.now();
        return evaluated.then(async (result: unknown) => (await botMsg).edit(await generateMessage(result, Date.now() - start)));
      }
      return generateMessage(evaluated, null).then(messageOptions => reply({ ...messageOptions, allowedMentions: { repliedUser: false } }));
    } catch (err) {
      return generateMessage(err, null, false).then(reply);
    }
  },
};

export default { ...command } as MentionCommand;

async function generateMessage(result: unknown, time: null | number, success = true, hastebin = false): Promise<MessageEditOptions & MessageReplyOptions> {
  if (hastebin) {
    const res = await superagent.post(`${config.hastebinLink}/documents`)
      .send(inspect(result, { depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity }))
      .catch(() => null);

    if (res?.ok) {
      const { key } = res.body as { key: string };
      const url = new URL(`${config.hastebinLink}/${key}.js`);
      return {
        content: `${success ? "✅ Evaluated successfully" : "❌ Javascript failed"}${time ? ` in ${time}ms` : ""}: ${url.toString()}`,
        components: [],
      };
    }

    return {
      content: `${success ? "✅ Evaluated successfully" : "❌ Javascript failed"}${time ? ` in ${time}ms` : ""}: (failed to upload to Hastebin)`,
      components: [],
    };
  }

  const content = generateContent(result, time, success);
  if (!content) return generateMessage(result, time, success, true);

  const identifier = randomBytes(16).toString("hex");
  buttonComponents.set(`${identifier}-hastebin`, {
    allowedUsers: [config.owner],
    callback(interaction) {
      void generateMessage(result, time, success, true).then(messageOptions => interaction.update(messageOptions));
    },
  });

  return {
    content,
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "Dump to Hastebin",
            style: ButtonStyle.Primary,
            customId: `${identifier}-hastebin`,
          },
        ],
      },
    ],
  };
}

function generateContent(result: unknown, time: null | number, success = true, depth = 10, maxArrayLength = 100): null | string {
  if (depth <= 0) return null;
  let content: null | string = `${success ? "✅ Evaluated successfully" : "❌ Javascript failed"}${time ? ` in ${time}ms` : ""}:\`\`\`ansi\n${inspect(result, { colors: true, depth, maxArrayLength })}\`\`\``;

  if (content.length > charactersPerMessage) {
    if (depth === 1 && Array.isArray(result) && maxArrayLength > 1) content = generateContent(result, time, success, depth, maxArrayLength - 1);
    else content = generateContent(result, time, success, depth - 1, maxArrayLength);
  }
  return content;
}
