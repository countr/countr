import { DebugCommandLevel } from ".";
import type { MentionCommand } from ".";
import { getGuildDocument } from "../../database";

const command: MentionCommand = {
  debugLevel: DebugCommandLevel.ADMIN,
  testArgs(args) { return args.length === 0 || args.length === 1; },
  async execute(message, reply, [guildId = message.guildId]) {
    const document = await getGuildDocument(guildId);
    const data = JSON.stringify(document.toJSON(), null, 2);
    const now = Date.now();

    return message.author.send({
      content: `💾 Guild data for server ${guildId} as of <t:${Math.floor(now / 1000)}:R>.`,
      files: [{ attachment: Buffer.from(data), name: `Countr-Dump-${guildId}-${now}.json` }],
    })
      .then(() => reply(`📨 Guild data of ${guildId === message.guildId ? "this server" : `server with ID \`${guildId}\``} has been dumped to your DMs.`))
      .catch(() => reply("❌ Something went wrong while trying to send you the data in DMs."));
  },
};

export default { ...command } as MentionCommand;
