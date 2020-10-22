const { getRole, getChannel } = require("./resolvers.js")

module.exports = {
  limitTriggers: 1,
  limitActions: 3,
  limitFlows: 5
}

module.exports.propertyTypes = {
  "numberX": {
    "short": "Number (X)",
    "help": "This can be any positive number.",
    "convert": async num => parseInt(num) || null
  },
  "regex": {
    "short": "Regex",
    "help": "Get help on how to create a regex here: oogabooga.com", // todo
    "convert": async regex => {
      try {
        new RegExp(regex);
        return regex;
      } catch(e) {
        return false;
      }
    }
  },
  "role": {
    "short": "Role",
    "help": "Any role. Make sure the role is below Countr's highest role.",
    "convert": async (search, { guild }) => {
      const result = await getRole(search, guild);
      if (result) return result.id; else return null;
    },
    "format": async roleid => `<@&${roleid}>`
  },
  "channel": {
    "short": "Channel",
    "help": "Any channel. Make sure Countr has access to the channel, and that it is a text based channel. (news channels also work)",
    "convert": async (search, { guild }) => {
      const result = await getChannel(search, guild);
      if (result) return result.id; else return null;
    },
    "format": async channelid => `<#${channelid}>`
  },
  "text": {
    "short": "Text",
    "help": "Any text. Get creative with these placeholders: " // todo
  }
};

for (const i in module.exports.propertyTypes) module.exports.propertyTypes[i] = Object.assign({
  "short": "N/A",
  "help": null,
  "convert": async any => any,
  "format": async any => any
}, module.exports.propertyTypes[i])

module.exports.flow = {
  triggers: {
    "each": {
      "short": "Each X number",
      "long": "This will get triggered whenever a user counts a multiple of X. For example, if X is 10, this will trigger on 10, 20, 30 etc.",
      "properties": [
        module.exports.propertyTypes.numberX
      ],
      "explanation": "When someone counts a multiplication of {0}"
    },
    "only": {
      "short": "Only number X",
      "long": "This will get triggered whenever a user counts the number X, and only the number X.",
      "properties": [
        module.exports.propertyTypes.numberX
      ],
      "explanation": "When someone counts the number {0}"
    },
    "score": {
      "short": "Score of X",
      "long": "This will get triggered whenever a user has counted a total of X counts.",
      "properties": [
        module.exports.propertyTypes.numberX
      ],
      "explanation": "When someone gets a score of {0}"
    },
    "regex": {
      "short": "Regex match",
      "long": "This will get triggered when a count matches a regex.",
      "properties": [
        module.exports.propertyTypes.regex
      ],
      "explanation": "When a message matches the regex `{0}`"
    }
  },
  actions: {
    "giverole": {
      "short": "Give a role to the user",
      "long": "This will add a role to the user who triggered this flow.",
      "properties": [
        module.exports.propertyTypes.role
      ],
      "explanation": "Add the user to {0}"
    },
    "takerole": {
      "short": "Take a role away from the user",
      "long": "This will remove a role from the user who triggered this flow.",
      "properties": [
        module.exports.propertyTypes.role
      ],
      "explanation": "Remove the user from {0}"
    },
    "prunerole": {
      "short": "Remove everyone from a role",
      "long": "This will remove everyone from this role.",
      "properties": [
        module.exports.propertyTypes.role
      ],
      "explanation": "Remove everyone from {0}"
    },
    "pin": {
      "short": "Pin the count message",
      "explanation": "Pin the count"
    },
    "sendmessage": {
      "short": "Send a message",
      "long": "This will send a message in a channel (it doesn't have to be the counting channel!)",
      "properties": [
        module.exports.propertyTypes.channel,
        module.exports.propertyTypes.text
      ],
      "explanation": "Send a message in {0}: ```{1}```"
    }
  }
}

for (const i in module.exports.flow.triggers) module.exports.flow.triggers[i] = Object.assign({
  "short": "N/A",
  "long": null,
  "properties": [],
  "explanation": "N/A"
}, module.exports.flow.triggers[i])

for (const i in module.exports.flow.actions) module.exports.flow.actions[i] = Object.assign({
  "short": "N/A",
  "long": null,
  "properties": [],
  "explanation": "N/A"
}, module.exports.flow.actions[i])

module.exports.formatExplanation = async ({ type, data }) => {
  let { properties, explanation } = module.exports.flow.triggers[type] || module.exports.flow.actions[type];
  for (const i in properties) explanation = explanation.replace(`{${i}}`, await properties[i].format(data[i]))
  return explanation;
}

const
  allActionTypes = Object.keys(module.exports.flow.actions),
  allActions = Object.values(module.exports.flow.actions),
  allTriggerTypes = Object.keys(module.exports.flow.triggers),
  allTriggers = Object.values(module.exports.flow.triggers),
  config = require("../../config.json")

module.exports.flowWalkthrough = async (guild, author, channel, newFlow, generateEmbed, pinned) => {
  let editing = true, successStatus = false;
  while (editing) {
    try {
      pinned.edit('', { embed: await generateEmbed() })
      const inputs = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), input = inputs.first(), messagesToDelete = [ input ];

      const args = input.content.split(" "), command = args.shift();

      if (command == "edit" && ["trigger", "action"].includes(args[0]) && parseInt(args[1])) {
        const slot = parseInt(args[1])
        if (args[0] == "trigger") {
          if (slot > module.exports.limitTriggers) messagesToDelete.push(await channel.send(`❌ You can only have ${module.exports.limitTriggers == 1 ? `1 trigger` : `${module.exports.limitTriggers} triggers`} per flow.`))
          else {
            messagesToDelete.push(await channel.send({
              embed: {
                title: `📝 Select Trigger for Slot ${slot}`,
                description: "0 - **Clear/Empty**\n\n" + allTriggers.map((trigger, index) => `${index + 1} - **${trigger.short}**${trigger.long ? `\n${trigger.long}` : ''}`).join("\n\n"),
                color: config.color,
                timestamp: Date.now()
              }
            }));
            const selections = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), selection = selections.first(), newTriggerIndex = parseInt(selection.content);
            messagesToDelete.push(selection);
            if (newTriggerIndex == 0) {
              newFlow.triggers[slot - 1] = null;
              messagesToDelete.push(await channel.send({
                embed: {
                  title: `✅ Trigger ${slot} is now cleared!`,
                  color: config.color,
                  timestamp: Date.now()
                }
              }))
            }
            else if (!newTriggerIndex || newTriggerIndex > allTriggerTypes.length) messagesToDelete.push(await channel.send(`✴️ Invalid trigger. Cancelled.`));
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
                const values = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), value = values.first(), convertedValue = await property.convert(value.content, { guild });
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
                      `> ${await module.exports.formatExplanation(newTrigger)}`
                    ].join("\n"),
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
                const confirmations = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), confirmation = confirmations.first(), confirmed = confirmation.content == "yes";
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
          if (slot > module.exports.limitActions) messagesToDelete.push(await channel.send(`❌ You can only have ${module.exports.limitActions == 1 ? `1 action` : `${module.exports.limitActions} actions`} per flow.`))
          else {
            messagesToDelete.push(await channel.send({
              embed: {
                title: `📝 Select Action for Slot ${slot}`,
                description: "0 - **Clear/Empty**\n\n" + allActions.map((action, index) => `${index + 1} - **${action.short}**${action.long ? `\n${action.long}` : ''}`).join("\n\n"),
                color: config.color,
                timestamp: Date.now()
              }
            }));
            const selections = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), selection = selections.first(), newActionIndex = parseInt(selection.content);
            messagesToDelete.push(selection);
            if (newActionIndex == 0) {
              newFlow.actions[slot - 1] = null;
              messagesToDelete.push(await channel.send({
                embed: {
                  title: `✅ Action ${slot} is now cleared!`,
                  color: config.color,
                  timestamp: Date.now()
                }
              }))
            }
            else if (!newActionIndex || newActionIndex > allActionTypes.length) messagesToDelete.push(await channel.send(`✴️ Invalid action. Cancelled.`));
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
                const values = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), value = values.first(), convertedValue = await property.convert(value.content, { guild });
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
                      `> ${await module.exports.formatExplanation(newAction)}`
                    ].join("\n"),
                    color: config.color,
                    timestamp: Date.now()
                  }
                }))
                const confirmations = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ 'time' ]}), confirmation = confirmations.first(), confirmed = confirmation.content == "yes";
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

      if (editing) setTimeout(() => channel.bulkDelete(messagesToDelete), 5000)
    } catch(e) {
      editing = false;
      console.log(e)
    }
  }
  return successStatus;
}