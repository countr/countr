const { flow } = require("./flow.js");

module.exports.formatExplanation = async ({ type, data }) => {
  let { properties, explanation } = flow.triggers[type] || flow.actions[type];
  for (const i in properties) explanation = explanation.replace(`{${i}}`, await properties[i].format(data[i]));
  return explanation;
};

const
  allActionTypes = Object.keys(flow.actions),
  allActions = Object.values(flow.actions),
  allTriggerTypes = Object.keys(flow.triggers),
  allTriggers = Object.values(flow.triggers),
  config = require("../../../config.json");

module.exports.flowWalkthrough = async (guild, author, channel, newFlow, generateEmbed, pinned) => {
  // add slots to fill it up when editing
  while (newFlow.triggers.length < module.exports.limitTriggers) newFlow.triggers.push(null);
  while (newFlow.actions.length < module.exports.limitActions) newFlow.actions.push(null);

  let editing = true, successStatus = false;
  while (editing) {
    try {
      pinned.edit("", { embed: await generateEmbed() });
      const inputs = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), input = inputs.first(), messagesToDelete = [ input ];

      const args = input.content.split(" "), command = args.shift().toLowerCase();

      if (command == "edit" && ["trigger", "action"].includes(args[0]) && parseInt(args[1])) {
        const slot = parseInt(args[1]);
        if (args[0] == "trigger") {
          if (slot > module.exports.limitTriggers) messagesToDelete.push(await channel.send(`❌ You can only have ${module.exports.limitTriggers == 1 ? "1 trigger" : `${module.exports.limitTriggers} triggers`} per flow.`));
          else {
            messagesToDelete.push(await channel.send({
              embed: {
                title: `📝 Select Trigger for Slot ${slot}`,
                description: "0 - **Clear/Empty**\n\n" + allTriggers.map((trigger, index) => `${index + 1} - **${trigger.short}**${trigger.long ? `\n${trigger.long}` : ""}`).join("\n\n"),
                color: config.color,
                timestamp: Date.now()
              }
            }));
            const selections = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), selection = selections.first(), newTriggerIndex = parseInt(selection.content);
            messagesToDelete.push(selection);
            if (newTriggerIndex == 0) {
              newFlow.triggers[slot - 1] = null;
              messagesToDelete.push(await channel.send({
                embed: {
                  title: `✅ Trigger ${slot} is now cleared!`,
                  color: config.color,
                  timestamp: Date.now()
                }
              }));
            }
            else if (!newTriggerIndex || newTriggerIndex > allTriggerTypes.length) messagesToDelete.push(await channel.send("✴️ Invalid trigger. Cancelled."));
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
                }));
                const values = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), value = values.first(), convertedValue = await property.convert(value.content, { guild });
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
                      `${(await module.exports.formatExplanation(newTrigger)).split("\n").map(l => `> ${l}`).join("\n")}`
                    ].join("\n"),
                    color: config.color,
                    timestamp: Date.now()
                  }
                }));
                const confirmations = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), confirmation = confirmations.first(), confirmed = confirmation.content.toLowerCase() == "yes";
                messagesToDelete.push(confirmation);
                if (confirmed) {
                  newFlow.triggers[slot - 1] = newTrigger;
                  messagesToDelete.push(await channel.send({
                    embed: {
                      title: `✅ Trigger ${slot} edited successfully!`,
                      color: config.color,
                      timestamp: Date.now()
                    }
                  }));
                } else messagesToDelete.push(await channel.send({
                  embed: {
                    title: `✴️ Cancelled edit of trigger ${slot}.`,
                    color: config.color,
                    timestamp: Date.now()
                  }
                }));
              }
            }
          }
        } else { // action
          if (slot > module.exports.limitActions) messagesToDelete.push(await channel.send(`❌ You can only have ${module.exports.limitActions == 1 ? "1 action" : `${module.exports.limitActions} actions`} per flow.`));
          else {
            messagesToDelete.push(await channel.send({
              embed: {
                title: `📝 Select Action for Slot ${slot}`,
                description: "0 - **Clear/Empty**\n\n" + allActions.map((action, index) => `${index + 1} - **${action.short}**${action.long ? `\n${action.long}` : ""}`).join("\n\n"),
                color: config.color,
                timestamp: Date.now()
              }
            }));
            const selections = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), selection = selections.first(), newActionIndex = parseInt(selection.content);
            messagesToDelete.push(selection);
            if (newActionIndex == 0) {
              newFlow.actions[slot - 1] = null;
              messagesToDelete.push(await channel.send({
                embed: {
                  title: `✅ Action ${slot} is now cleared!`,
                  color: config.color,
                  timestamp: Date.now()
                }
              }));
            }
            else if (!newActionIndex || newActionIndex > allActionTypes.length) messagesToDelete.push(await channel.send("✴️ Invalid action. Cancelled."));
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
                }));
                const values = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), value = values.first(), convertedValue = await property.convert(value.content, { guild });
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
                      `${(await module.exports.formatExplanation(newAction)).split("\n").map(l => `> ${l}`).join("\n")}`
                    ].join("\n"),
                    color: config.color,
                    timestamp: Date.now()
                  }
                }));
                const confirmations = await channel.awaitMessages(m => m.author.id == author.id, { max: 1, time: 1800000, errors: [ "time" ]}), confirmation = confirmations.first(), confirmed = confirmation.content.toLowerCase() == "yes";
                messagesToDelete.push(confirmation);
                if (confirmed) {
                  newFlow.actions[slot - 1] = newAction;
                  messagesToDelete.push(await channel.send({
                    embed: {
                      title: `✅ Action ${slot} edited successfully!`,
                      color: config.color,
                      timestamp: Date.now()
                    }
                  }));
                } else messagesToDelete.push(await channel.send({
                  embed: {
                    title: `✴️ Cancelled edit of action ${slot}.`,
                    color: config.color,
                    timestamp: Date.now()
                  }
                }));
              }
            }
          }
        }
      }
      else if (command == "save") {
        if (newFlow.triggers.find(t => t) && newFlow.actions.find(a => a)) {
          editing = false;
          successStatus = true;
        } else messagesToDelete.push(await channel.send("❌ You need at least one trigger and one action for a flow!"));
      }
      else if (command == "cancel") editing = false;
      else if (command == "help") messagesToDelete.push(await channel.send(`🔗 Check the pinned message for help! ${pinned.url}`));
      else if (command !== "#") messagesToDelete.push(await channel.send("❌ Invalid request. See the pinned message for more information!"));

      if (command !== "#" && editing) setTimeout(() => channel.bulkDelete(messagesToDelete), 5000);
    } catch(e) {
      editing = false;
      console.log(e);
    }
  }
  return successStatus;
};
