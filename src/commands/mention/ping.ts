import type { MentionCommand } from ".";
import { msToTime } from "../../utils/time";

export default {
  execute: (message, reply) => reply("〽️ Pinging...").then(m => {
    m.edit(`🏓 Server latency is \`${m.createdTimestamp - message.createdTimestamp}ms\`, API latenchy is \`${Math.round(message.client.ws.ping)}ms\` and my uptime is \`${msToTime(message.client.uptime || 0)}\``);
    return m;
  }),
  testArgs(args) {
    return args.length === 0;
  },
} as MentionCommand;
