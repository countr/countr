import type { MentionCommand } from ".";
import { DebugCommandLevel } from "../../constants/permissions";
import { msToHumanShortTime } from "../../utils/time";

const command: MentionCommand = {
  aliases: ["pong", ""],
  debugLevel: DebugCommandLevel.None,
  testArgs(args) { return args.length === 0; },
  async execute(message, reply) {
    const start = Date.now();
    await message.client.rest.get("/gateway");
    return reply(`🏓 Gateway latency is \`${Date.now() - start}ms\`, heartbeat latency is \`${Math.ceil(message.guild.shard.ping)}ms\` and my uptime is \`${msToHumanShortTime(message.client.uptime)}\`.`);
  },
};

export default { ...command } as MentionCommand;
