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

const { limitTriggers, limitActions, limitFlows, generateID, propertyTypes, flow } = require("../constants/index.js"), config = require("../../config.json"), allActionTypes = Object.keys(flow.actions), allActions = Object.values(flow.actions), allTriggerTypes = Object.keys(flow.triggers), allTriggers = Object.values(flow.triggers);

module.exports.run = async (message, args, gdb) => {
  let { flows } = gdb.get();
  if (Object.keys(flows).length >= limitFlows) return message.channel.send(`❌ You can only have ${limitFlows} flows configured.`)

  if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("❌ The bot is missing the `Manage Channels`-permission. When creating a flow, the bot will create a new channel so you can configure your flow.")

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
        `You can have ${limitTriggers == 1 ? `1 trigger` : `${limitTriggers} triggers`} and ${limitActions == 1 ? `1 action` : `${limitActions} actions`} per flow.`
      ].join("\n\n"),
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Serving ${message.author.tag}`
      },
      fields: [
        {
          name: "Flow Commands",
          value: [
            "• `edit <trigger or action> <slot>`: Edit a trigger or action's slot.",
            "• `finish`: Finish the flow and save it.",
            "• `cancel`: Cancel the creation without saving.",
            "**The commands does not require the bot prefix, just simply write it in the channel.** Also notice that normal bot commands have been disabled in this channel."
          ].join("\n")
        },
        {
          name: "Current Flow Actions",
          value: await Promise.all(newFlow.actions.map(async (action, index) => `${index + 1} - ${action ? `${await formatExplanation(action)}` : "**Empty**"}`)),
          inline: true
        },
        {
          name: "Current Flow Triggers",
          value: await Promise.all(newFlow.triggers.map(async (trigger, index) => `${index + 1} - ${trigger ? `${await formatExplanation(trigger)}` : "**Empty**"}`)),
          inline: true
        }
      ]
    }),
    pinned = await channel.send("Loading ...")

  await pinned.pin();

  let editing = true, successStatus = false;
  while (editing) {
    try {
      pinned.edit('', { embed: await generateEmbed() })
      const inputs = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), input = inputs.first(), messagesToDelete = [ input ];

      const args = input.content.split(" "), command = args.shift();

      if (command == "edit" && ["trigger", "action"].includes(args[0]) && parseInt(args[1])) {
        const slot = parseInt(args[1])
        if (args[0] == "trigger") {
          if (slot > limitTriggers) messagesToDelete.push(await channel.send(`❌ You can only have ${limitTriggers == 1 ? `1 trigger` : `${limitTriggers} triggers`} and ${limitActions == 1 ? `1 action` : `${limitActions} actions`} per flow.`))
          else {
            if (slot > limitTriggers) messagesToDelete.push(await channel.send(`❌ You can only have ${limitTriggers == 1 ? `1 trigger` : `${limitTriggers} triggers`} and ${limitActions == 1 ? `1 action` : `${limitActions} actions`} per flow.`))
            messagesToDelete.push(await channel.send({
              embed: {
                title: `📝 Select Trigger for Slot ${slot}`,
                description: allTriggers.map((trigger, index) => `${index + 1} - **${trigger.short}**${trigger.long ? `\n${trigger.long}` : ''}`).join("\n\n"),
                color: config.color,
                timestamp: Date.now()
              }
            }));
            const selections = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), selection = selections.first(), newTriggerIndex = parseInt(selection.content);
            messagesToDelete.push(selection);
            if (!newTriggerIndex || newTriggerIndex > allTriggerTypes.length) messagesToDelete.push(await channel.send(`✴️ Invalid trigger. Cancelled.`));
            else {
              let trigger = allTriggers[newTriggerIndex - 1], newTrigger = {
                "type": allTriggerTypes[newTriggerIndex - 1],
                "data": []
              };
              for (const property of trigger.properties) {
                messagesToDelete.push(await channel.send({
                  embed: {
                    title: `✏️ Define ${property.short}`,
                    description: property.help || undefined,
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
                const values = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), value = values.first(), convertedValue = await property.convert(value.content, { guild: message.guild });
                messagesToDelete.push(value);
                if (convertedValue == null) {
                  messagesToDelete.push(await channel.send({
                    embed: {
                      title: `❌ Invalid value. Cancelled edit of trigger ${slot}.`,
                      color: config.color,
                      timestamp: Date.now()
                    }
                  }));
                  break;
                } else newTrigger.data.push(convertedValue);
              }
              if (newTrigger.data.length == trigger.properties.length) {
                messagesToDelete.push(await channel.send({
                  embed: {
                    title: `💨 Confirm trigger ${slot}`,
                    description: [
                      "**Does this seem correct to you? Type yes or no in chat.**",
                      `> ${await formatExplanation(newTrigger)}`
                    ].join("\n"),
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
                const confirmations = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), confirmation = confirmations.first(), confirmed = confirmation.content == "yes";
                messagesToDelete.push(confirmation)
                if (confirmed) {
                  newFlow.triggers[slot - 1] = newTrigger;
                  messagesToDelete.push(await channel.send({
                    embed: {
                      title: `✅ Trigger ${slot} edited successfully!`,
                      color: config.color,
                      timestamp: Date.now()
                    }
                  }))
                } else messagesToDelete.push(await channel.send({
                  embed: {
                    title: `✴️ Cancelled edit of trigger ${slot}.`,
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
              }
            }
          }
        } else { // action
          if (slot > limitActions) messagesToDelete.push(await channel.send(`❌ You can not blabla`)) // todo
          else {
            messagesToDelete.push(await channel.send({
              embed: {
                title: `📝 Select Action for Slot ${slot}`,
                description: allActions.map((action, index) => `${index + 1} - **${action.short}**${action.long ? `\n${action.long}` : ''}`).join("\n\n"),
                color: config.color,
                timestamp: Date.now()
              }
            }));
            const selections = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), selection = selections.first(), newActionIndex = parseInt(selection.content);
            messagesToDelete.push(selection);
            if (!newActionIndex || newActionIndex > allActionTypes.length) messagesToDelete.push(await channel.send(`✴️ Invalid action. Cancelled.`));
            else {
              let action = allActions[newActionIndex - 1], newAction = {
                "type": allActionTypes[newActionIndex - 1],
                "data": []
              };
              for (const property of action.properties) {
                messagesToDelete.push(await channel.send({
                  embed: {
                    title: `✏️ Define ${property.short}`,
                    description: property.help || undefined,
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
                const values = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), value = values.first(), convertedValue = await property.convert(value.content, { guild: message.guild });
                messagesToDelete.push(value);
                if (convertedValue == null) {
                  messagesToDelete.push(await channel.send({
                    embed: {
                      title: `❌ Invalid value. Cancelled edit of action ${slot}.`,
                      color: config.color,
                      timestamp: Date.now()
                    }
                  }));
                  break;
                } else newAction.data.push(convertedValue);
              }
              if (newAction.data.length == action.properties.length) {
                messagesToDelete.push(await channel.send({
                  embed: {
                    title: `💨 Confirm action ${slot}`,
                    description: [
                      "**Does this seem correct to you? Type yes or no in chat.**",
                      `> ${await formatExplanation(newAction)}`
                    ].join("\n"),
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
                const confirmations = await channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), confirmation = confirmations.first(), confirmed = confirmation.content == "yes";
                messagesToDelete.push(confirmation)
                if (confirmed) {
                  newFlow.actions[slot - 1] = newAction;
                  messagesToDelete.push(await channel.send({
                    embed: {
                      title: `✅ Action ${slot} edited successfully!`,
                      color: config.color,
                      timestamp: Date.now()
                    }
                  }))
                } else messagesToDelete.push(await channel.send({
                  embed: {
                    title: `✴️ Cancelled edit of action ${slot}.`,
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
              }
            }
          }
        }
      }
      else if (command == "finish") {
        if (newFlow.triggers.find(t => t) && newFlow.actions.find(a => a)) {
          editing = false;
          successStatus = true;
        } else messagesToDelete.push(await channel.send(`❌ You need at least one trigger and one action for a flow!`))
      }
      else if (command == "cancel") editing = false;
      else if (command == "help") messagesToDelete.push(await channel.send(`🔗 Check the pinned message for help! ${pinned.url}`));
      else messagesToDelete.push(await channel.send(`❌ Invalid request. See the pinned message for more information!`))

      if (!["finish", "cancel"].includes(command)) setTimeout(() => channel.bulkDelete(messagesToDelete), 5000)
    } catch(e) {
      editing = false;
      console.log(e)
    }
  }

  channel.delete();
  gdb.editFlow(flowID, newFlow);
  if (successStatus) status.edit(`✅ Flow \`${flowID}\` has been created.`);
  else status.edit(`✴️ Flow creation has been cancelled.`);
}

async function formatExplanation({ type, data }) {
  let { properties, explanation } = flow.triggers[type] || flow.actions[type];
  for (const i in properties) explanation = explanation.replace(`{${i}}`, await properties[i].format(data[i]))
  return explanation;
}