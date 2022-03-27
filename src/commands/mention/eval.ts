import type { MentionCommand } from ".";
import { inspect } from "util";

export default {
  execute: (_, reply, args) => {
    try {
      const code = args.join(" ");
      const evaled = eval(code);

      if (evaled instanceof Promise) {
        const botMsg = reply("♨️ Running...");
        const start = Date.now();
        evaled.then(async result => {
          const end = Date.now();
          (await botMsg).edit(`🆗 Evaluated in \`${end - start}ms\`: \`\`\`js\n${typeof result === "string" ? result : inspect(result)}\`\`\``);
        });
        return botMsg;
      }
      return reply(`🆗 Evaluated successfully: \`\`\`js\n${typeof evaled === "string" ? evaled : inspect(evaled)}\`\`\``);
    } catch (e) {
      return reply(`🆘 JavaScript failed: \`\`\`fix\n${inspect(e)}\`\`\``);
    }
  },
  testArgs(args) {
    return args.length > 0;
  },
} as MentionCommand;
