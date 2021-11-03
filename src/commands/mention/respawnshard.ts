import { MentionCommand } from "../../types/command";

export default {
  execute: async (message, args) => {
    let shards = args.map(num => parseInt(num)).filter(num => !isNaN(num));

    if (!message.client.shard) return; // typescript
    const [thisShard] = message.client.shard.ids;
    if (shards.includes(thisShard)) shards = [...shards.filter(s => s !== thisShard), thisShard]; // restart this shard last

    if (!shards.length) return message.channel.send("❌ No shards were found with your query.");
    else if (shards.length > 1) {
      const m = await message.channel.send(`🔄 Restarting shards ${shards.join(", ")} with a 10-second delay... (Done <t:${Math.ceil((Date.now() + shards.length * 10000) / 1000)}:R>)`);
      for (const shard of shards.filter(s => s !== thisShard)) {
        message.client.shard.broadcastEval(client => client.shard?.send("respawn"), { shard });
        await new Promise(resolve => { setTimeout(resolve, 10000); });
      }
      if (shards.includes(thisShard)) return m.edit(`✅ Restarted shards ${shards.filter(s => s !== thisShard).join(", ")}. (Shard ${thisShard} is restarting after this message is posted)`).then(() => message.client.shard?.send("respawn"));
      return m.edit(`✅ Restarted shards ${shards.join(", ")}.`);
    } return message.channel.send(`✅ Restarting shard ${shards[0]}.`).then(() => message.client.shard?.broadcastEval(client => client.shard?.send("respawn"), { shard: shards[0] }));
  },
  minArguments: 1,
} as MentionCommand;
