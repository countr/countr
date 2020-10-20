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
  checkArgs: (args) => !args.length
}

const { limitTriggers, limitActions, limitFlows, generateID, propertyTypes, flow } = require("../constants/index.js"), config = require("../../config.json");

module.exports.run = async (message, args, gdb) => {
  let { flows } = gdb.get();
  if (flows.length >= limitFlows) return message.channel.send(`❌ You can only have ${limitFlows} flows at once.`)

  if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("❌ The bot is missing the `Manage Channels`-permission. When creating a flow, the bot will create a new channel so you can configure your flow.")

  const
    flowID = generateID(Object.keys(flows)),
    channel = await message.guild.channels.create("new-countr-flow", {
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
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Serving ${message.author.tag}`
      },
      fields: [
        {
          name: "Triggers",
          value: await Promise.all(newFlow.triggers.map(async (trigger, index) => `${index + 1} - ${trigger ? await formatExplanation(trigger) : "**Empty**"}`))
        },
        {
          name: "Actions",
          value: await Promise.all(newFlow.actions.map(async (action, index) => `${index + 1} - ${action ? await formatExplanation(action) : "**Empty**"}`))
        }
      ]
    }),
    pinned = await channel.send("Loading ...")

  await pinned.pin();

  let editing = true, successStatus = false;
  while (editing) {
    try {
      pinned.edit({ embed: await generateEmbed() })
      const inputs = channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), input = inputs.first(), messagesToDelete = [ input ];

      const args = input.split(" "), command = args.shift();

      if (command == "edit" && !args[1] || !["trigger", "action"].includes(args[0]) || !parseInt(args[1])) {
        const i = parseInt(args[1])
        if (args[0] == "trigger") {
          
        } else {

        }
      }
      else if (command == "finish") {
        editing = false;
        successStatus = true;

        gdb.createFlow(flowID, newFlow)
      }
      else if (command == "cancel") {
        editing = false;
        successStatus = "cancelled";
      }
      else if (command == "help") messagesToDelete.push(await channel.send(`🔗 Check the pinned message for help! ${pinned.url}`));
      else messagesToDelete.push(await channel.send(`❌ Invalid request. See the pinned message for more information!`))

      if (!["finish", "cancel"].includes(command)) setTimeout(() => channel.bulkDelete(messagesToDelete), 15000)
    } catch(e) {
      editing = false;
      console.log(e)
    }
  }

  channel.delete();
  console.log(newFlow);
  if (success) status.edit(`✅ Flow \`${flowID}\` has been created.`);
  else status.edit(`✴️ Flow creation has been cancelled.`);
}

async function formatExplanation({ type, data }) {
  let { properties, explanation } = propertyTypes[type];
  for (const i in properties) explanation = explanation.replace(new RegExp(`{${i}}`, 'g'), await properties[i].format(data[i]))
  return explanation;
}