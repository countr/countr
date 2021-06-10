module.exports = {
  description: "Get a list of all the flows.",
  usage: {
    "[flowID]": "ID of a flow"
  },
  examples: {
    "hY5C4i": "Get information of the flow with ID `hY5C4i`"
  },
  aliases: [ "listflow", "flows", "flow" ],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length <= 1
};

const { limitFlows, formatExplanation, /*generateTip, */limitTriggers, limitActions } = require("../constants/index.js"), config = require("../../config.json");

module.exports.run = async (message, [ query ], gdb, { prefix }) => {
  const { flows } = gdb.get();

  const flowIDs = Object.keys(flows).slice(0, limitFlows);

  if (flowIDs.length) {
    if(query && flowIDs.includes(query)) {
      const triggers = await formatTriggers(flows[query]);
      const actions = await formatActions(flows[query]);
      return message.channel.send({embed: {
        title: `Flow \`${query}\``,
        color: config.color,
        timestamp: Date.now(),
        footer: {
          icon_url: message.author.displayAvatarURL(),
          text: `Requested by ${message.author.tag}`
        },
        fields: [
          {
            name: "Triggers:",
            value: triggers.length > 1024 ? triggers.slice(0, 1002) + " [Too long to show...]" : triggers,
          },
          {
            name: "Actions:",
            value: actions.length > 1024 ? actions.slice(0, 1002) + " [Too long to show...]" : actions,
          }
        ]
      }});
    }
    return message.channel.send({
      embed: {
        title: "List of Flows",
        description: `You have ${flowIDs.length}/${limitFlows} flows.`,
        color: config.color,
        timestamp: Date.now(),
        footer: {
          icon_url: message.author.displayAvatarURL(),
          text: `Requested by ${message.author.tag}`
        },
        fields: await Promise.all(flowIDs.map(async flowID => {
          const val = ([
            "**Triggers:**",
            await formatTriggers(flows[flowID]),
            "**Actions:**",
            await formatActions(flows[flowID])
          ].join("\n").split("\n").map(l => `> ${l}`).join("\n") + "\n** **");
          return ({
            name: `Flow \`${flowID}\``,
            value: val.length > 1024 ? val.slice(0, 1002) + " [Too long to show...]" : val,
            inline: true
          });
        }))
      }
    })
    //.then(m => m.edit(generateTip(prefix)))
      .catch(() => message.channel.send("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
  }
  else return message.channel.send("❌ This server doesn't have any flows configured.");
};

async function formatTriggers(flow) {
  const formatted = await Promise.all(flow.triggers.slice(0, limitTriggers).filter(t => t).map(async trigger => `• ${await formatExplanation(trigger)}`));
  return formatted.join("\n");
}

async function formatActions(flow) {
  const formatted = await Promise.all(flow.actions.slice(0, limitActions).filter(t => t).map(async trigger => `• ${await formatExplanation(trigger)}`));
  return formatted.join("\n");
}
