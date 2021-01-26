/*

- limit to 1 trigger, 5 for premium
- limit to 3 actions, 10 for premium
- limit to 5 flows, 25 for premium

flowchart:
- check if the server can have more flowcharts
- create a new channel for the flowchart creation, so it's easier to see what's been done etc.
- explain that this is a tedious process but that it will only have to be done once, and the output will be good
- ask first what the trigger is/triggers are going to be (depending on premium)
- "next" will go to the next step
- ask what the action is/actions are going to be
- 
 */

module.exports = {
  description: "Create a new flow to customize your counting setup completely.",
  usage: {},
  examples: {},
  aliases: [ "addflow", "+flow" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length,
  allowInCountingChannel: true
};

const { flowWalkthrough, formatExplanation, limitTriggers, limitActions, limitFlows, generateID } = require("../constants/index.js"), config = require("../../config.json");

module.exports.run = async (message, _, gdb) => {
  let { flows } = gdb.get();
  if (Object.keys(flows).length >= limitFlows) return message.channel.send(`❌ You can only have ${limitFlows} flows configured.`);

  if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("❌ The bot is missing the `Manage Channels`-permission. When creating a flow, the bot will create a new channel so you can configure your flow.");

  const
    flowID = generateID(Object.keys(flows)),
    channel = await message.guild.channels.create("countr-flow-editor", {
      permissionOverwrites: [
        {
          id: message.client.user.id,
          allow: [
            "VIEW_CHANNEL",
            "SEND_MESSAGES",
            "MANAGE_MESSAGES",
            "EMBED_LINKS",
            "READ_MESSAGE_HISTORY"
          ]
        },
        {
          id: message.author.id,
          allow: [
            "VIEW_CHANNEL",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY"
          ]
        },
        {
          id: message.guild.roles.everyone,
          deny: [
            "VIEW_CHANNEL"
          ]
        }
      ]
    }),
    status = await message.channel.send(`🌀 Head over to ${channel}, and let's make something beautiful!`),
    newFlow = {
      triggers: Array(limitTriggers).fill(null), // { type, data }
      actions: Array(limitActions).fill(null) // { type, data }
    },
    generateEmbed = async () => ({
      title: "🌀 Creating a new flow",
      description: [
        "Welcome to the flow creator! I will guide you through the process of creating a new flow. This can be tedious sometimes, but you can customize it completely. Basically, a trigger is something that will activate and run this flow. An action is something the flow will do once it's triggered.",
        "Get started by creating a trigger with the command `edit trigger 1`, and also create an action with `edit action 1`.",
        `You can have ${limitTriggers == 1 ? "1 trigger" : `${limitTriggers} triggers`} and ${limitActions == 1 ? "1 action" : `${limitActions} actions`} per flow.`
      ].join("\n\n"),
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Serving ${message.author.tag} • Make sure to save the flow!`
      },
      fields: [
        {
          name: "Flow Commands",
          value: [
            "• `edit <trigger or action> <slot>`: Edit a trigger or action's slot.",
            "• `save`: Save the flow.",
            "• `cancel`: Cancel the creation without saving.",
            "**__The commands do not require the bot prefix, just simply write it in the channel.__** Also notice that normal bot commands have been disabled in this channel."
          ].join("\n")
        },
        {
          name: "Current Flow Actions",
          value: cutFieldValue(await Promise.all(newFlow.actions.map(async (action, index) => `${index + 1} - ${action ? `${await formatExplanation(action)}` : "**Empty**"}`))),
          inline: true
        },
        {
          name: "Current Flow Triggers",
          value: cutFieldValue(await Promise.all(newFlow.triggers.map(async (trigger, index) => `${index + 1} - ${trigger ? `${await formatExplanation(trigger)}` : "**Empty**"}`))),
          inline: true
        }
      ]
    }),
    pinned = await channel.send("Loading ...");

  await pinned.pin();
  const success = await flowWalkthrough(message.guild, message.author, channel, newFlow, generateEmbed, pinned);

  channel.delete();
  if (success) gdb.setOnObject("flows", flowID, newFlow) && status.edit(`✅ Flow \`${flowID}\` has been created.`);
  else status.edit("✴️ Flow creation has been cancelled.");
  return message;
};

function cutFieldValue(value) {
  value = value.join("\n");
  if (value.length > 1024) return value.slice(0, 1002) + " [Too long to show...]";
  else return value;
}
