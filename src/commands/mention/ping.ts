import { DebugCommandLevel } from "../../constants/permissions";
import type { MentionCommand } from ".";
import { msToHumanShortTime } from "../../utils/time";

const command: MentionCommand = {
  aliases: ["pong", ""],
  debugLevel: DebugCommandLevel.None,
  testArgs(args) { return args.length === 0; },
  async execute(message, reply) {
    const now = Date.now();
    const botMessage = await reply("〽️ Pinging...");
    return botMessage.edit(`🏓 Server latency is \`${Date.now() - now}ms\`, shard latency is \`${Math.ceil(message.guild.shard.ping)}ms\` and my uptime is \`${msToHumanShortTime(message.client.uptime)}\`.`);
  },
};

export default { ...command } as MentionCommand;
