module.exports = {
  description: "Respawn shards.",
  usage: {
    "<shard(s...)>": "The shard(s) you want to respawn."
  },
  examples: {},
  aliases: [ "respawn" ],
  permissionRequired: 4, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.find(a => isNaN(parseInt(a))),
  allowInCountingChannel: true
};

module.exports.run = async (message, _, gdb, { content }) => {
  let shards = content.split(" ").map(s => parseInt(s));
  if (shards.includes(message.client.shard.ids[0])) { // restart this shard last
    shards = shards.filter(s => s !== message.client.shard.ids[0]);
    shards.push(message.client.shard.ids[0]);
  }

  if (shards.length > 1) {
    await message.channel.send(`✅ Restarting shards ${shards.map(s => `\`${s}\``).join(", ")} with a 10-second delay between each one.`);
    for (const shard of shards) {
      message.client.shard.broadcastEval(client => client.shard.send("respawn"), shard)
        .catch(e => message.channel.send(`❌ Error while restarting shard \`${shard}\`:\`\`\`fix\n${e}\`\`\``));
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  } else {
    await message.channel.send(`✅ Restarting shard \`${shards[0]}\`.`);
    message.client.shard.broadcastEval(client => client.shard.send("respawn"), shards[0])
      .catch(e => message.channel.send(`❌ Error while restarting shard \`${shards[0]}\`:\`\`\`fix\n${e}\`\`\``));
  }
};
