import { DebugCommandLevel } from "../../constants/permissions";
import { msToHumanShortTime } from "../../utils/time";
import type { MentionCommand } from ".";

const command: MentionCommand = {
  aliases: ["pingserver", "realping"],
  debugLevel: DebugCommandLevel.None,
  testArgs(args) { return args.length === 0; },
  async execute(message, reply) {
    const now = Date.now();
    const botMessage = await reply("〽️ Pinging...");
    return botMessage.edit(`🏓 Server latency is \`${Date.now() - now}ms\`, shard latency is \`${Math.ceil(message.guild.shard.ping)}ms\` and my uptime is \`${msToHumanShortTime(message.client.uptime)}\`.`);
  },
};

export default { ...command } as MentionCommand;
