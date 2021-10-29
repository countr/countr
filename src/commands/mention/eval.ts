import { inspect } from "util";
import { MentionCommand } from "../../types/command";

export default {
  execute: async (message, args) => {
    try {
      const code = args.join(" ");
      const evaled = eval(code);

      if (evaled instanceof Promise) {
        const start = Date.now();
        return await Promise.all([ message.channel.send("♨️ Running..."), evaled ]).then(([ botMsg, output ]) => {
          botMsg.edit(`🆗 Evaluated successfully (\`${Date.now() - start}ms\`).\n\`\`\`js\n${
            typeof output !== "string" ? inspect(output) : output
          }\`\`\``);
          return botMsg;
        });
      } else return await message.reply(`🆗 Evaluated successfully.\n\`\`\`js\n${
        typeof evaled !== "string" ? inspect(evaled) : evaled
      }\`\`\``);

    } catch(e) {
      return message.channel.send(`🆘 JavaScript failed.\n\`\`\`fix\n${
        typeof e == "string" ? e.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)) : e
      }\`\`\``);
    }
  },
  minArguments: 1
} as MentionCommand;
