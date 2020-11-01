module.exports = {
  description: "Get a list of all the flows.",
  usage: {},
  examples: {},
  aliases: [ "flows" ],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
};

const { limitFlows, formatExplanation, generateTip } = require("../constants/index.js"), config = require("../../config.json");

module.exports.run = async (message, _, gdb, { prefix }) => {
  const { flows } = gdb.get();

  const flowIDs = Object.keys(flows).slice(0, limitFlows);

  if (flowIDs.length) return message.channel.send(generateTip(prefix), {
    embed: {
      title: "List of Flows",
      description: `You have ${flowIDs.length}/${limitFlows} flows.`,
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Requested by ${message.author.tag}`
      },
      fields: await Promise.all(flowIDs.map(async flowID => ({
        name: `Flow \`${flowID}\``,
        value: [
          "**Triggers:**",
          await formatTriggers(flows[flowID]),
          "**Actions:**",
          await formatActions(flows[flowID])
        ].join("\n").split("\n").map(l => `> ${l}`).join("\n") + "\n** **",
        inline: true
      })))
    }
  }); else return message.channel.send("❌ This server doesn't have any flows configured.");
};

async function formatTriggers(flow) {
  const formatted = await Promise.all(flow.triggers.filter(t => t).map(async trigger => `• ${await formatExplanation(trigger)}`));
  return formatted.join("\n");
}

async function formatActions(flow) {
  const formatted = await Promise.all(flow.actions.filter(t => t).map(async trigger => `• ${await formatExplanation(trigger)}`));
  return formatted.join("\n");
}