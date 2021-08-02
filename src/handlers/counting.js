const { getPermissionLevel, limitFlows, flow: { triggers: allTriggers, actions: allActions }, limitTriggers, limitActions } = require("../constants/index.js"), config = require("../../config.json"), countingFails = new Map(), RE2 = require("re2");

module.exports = async (message, gdb) => {
  const permissionLevel = getPermissionLevel(message.member);

  if (message.content.startsWith("!") && permissionLevel >= 1) return;

  let { count, user, modules, regex, notifications, flows, users: scores, timeoutrole } = gdb.get(), regexMatches = false, flowIDs = Object.keys(flows).slice(0, limitFlows);
  if (regex.length && permissionLevel == 0)
    for (let r of regex)
      if ((new RE2(r, "g")).test(message.content)) {
        regexMatches = true;
        break;
      }
  
  if (
    regexMatches ||
    (!modules.includes("allow-spam") && message.author.id == user) ||
    (!modules.includes("talking") && message.content !== (count + 1).toString()) ||
    message.content.split(" ")[0] !== (count + 1).toString()
  ) {
    // set up countdata for flows
    const countData = {
      count,
      score: scores[message.author.id] || 0,
      message,
      countingMessage: message,
      gdb
    };

    deleteMessage(message);

    if (timeoutrole.role && !message.member.roles.cache.get(timeoutrole.role)) {
      const failID = `${message.guild.id}/${message.author.id}`;
      if (!countingFails.has(failID)) countingFails.set(failID, 1);
      else countingFails.set(failID, countingFails.get(failID) + 1);
      setTimeout(() => countingFails.set(failID, countingFails.get(failID) - 1), timeoutrole.time * 1000);

      const fails = countingFails.get(failID);
      if (fails >= timeoutrole.fails) {
        if (timeoutrole.duration) gdb.setOnObject("timeouts", message.author.id, Date.now() + timeoutrole.duration * 1000);
        try {
          await message.member.roles.add(timeoutrole.role);
          if (timeoutrole.duration) setTimeout(() => {
            message.member.roles.remove(timeoutrole.role);
            gdb.removeFromObject("timeouts", message.author.id);
          }, timeoutrole.duration * 1000);

          // trigger timeout flows
          for (const flowID of flowIDs) try {
            const flow = flows[flowID];
            if (flow.triggers.slice(0, limitTriggers).find(t => t.type == "timeout"))
              for (const action of flow.actions.slice(0, limitActions).filter(a => a)) try {
                await allActions[action.type].run(countData, action.data);
              } catch(e) { /* something went wrong */ }
          } catch(e) { /* something went wrong */ }
        } catch(e) { /* something went wrong */ }
      }
    }

    // trigger countfail flows
    for (const flowID of flowIDs) try {
      const flow = flows[flowID];
      if (flow.triggers.slice(0, limitTriggers).find(t => t.type == "countfail"))
        for (const action of flow.actions.slice(0, limitActions).filter(a => a)) try {
          await allActions[action.type].run(countData, action.data);
        } catch(e) { /* something went wrong */ }
    } catch(e) { /* something went wrong */ }

    return;
  }

  count++;
  gdb.addToCount(message.member);

  let countingMessage = message;
  if (modules.includes("webhook")) try {
    let webhooks = await message.channel.fetchWebhooks(), webhook = webhooks.find(wh => wh.name == "Countr");
    if (!webhook) webhook = await message.channel.createWebhook("Countr").catch(() => null);

    if (webhook) {
      countingMessage = await webhook.send(message.content, {
        username: message.author.username,
        avatarURL: message.author.displayAvatarURL({ dynamic: true }),
      });
      deleteMessage(message);
    }
  } catch(e) { /* something went wrong */ }
  else if (modules.includes("reposting")) try {
    countingMessage = await message.channel.send(`${message.author}: ${message.content}`);
    deleteMessage(message);
  } catch(e) { /* something went wrong */ }
  else if (modules.includes("embed")) try {
    countingMessage = await message.channel.send({
      embed: {
        description: `${message.author}: ${message.content}`,
        color: message.member.displayColor || 3553598
      }
    });
    deleteMessage(message);
  } catch(e) { /* something went wrong */ }

  gdb.set("message", countingMessage.id);

  for (const notifID in notifications) {
    const notif = notifications[notifID];
    if (notif && (
      notif.mode == "only" && count == notif.count ||
      notif.mode == "each" && count % notif.count == 0
    )) {
      try {
        const receiver = await message.guild.members.fetch(notif.user);
        if (receiver) receiver.send({
          embed: {
            description: [
              `🎉 **${message.guild} reached ${count} total counts!**`,
              `The user who sent it was ${message.author}.`,
              "",
              `[**→ Click here to jump to the message!**](${countingMessage.url})`,
            ].join("\n"),
            color: config.color,
            timestamp: Date.now(),
            thumbnail: {
              url: message.author.displayAvatarURL({ dynamic: true, size: 512 })
            },
            footer: {
              text: `Notification ID ${notifID}`
            }
          }
        });
      } catch(e) { /* something went wrong */ }
      if (notif.mode == "only") {
        delete notifications[notifID];
        gdb.set("notifications", notifications);
      }
    }
  }

  // check flows
  const countData = {
    count,
    score: scores[message.author.id] || 0,
    message,
    countingMessage,
    gdb
  };
  for (const flowID of flowIDs) try {
    const flow = flows[flowID]; let success;
    for (const trigger of flow.triggers.slice(0, limitTriggers).filter(t => t)) {
      success = await allTriggers[trigger.type].check(countData, trigger.data);
      if (success) break;
    }
    if (success)
      for (const action of flow.actions.slice(0, limitActions).filter(a => a)) try {
        await allActions[action.type].run(countData, action.data);
      } catch(e) { /* something went wrong */ }
  } catch(e) { /* something went wrong */ }
};

const bulks = new Map(), rates = new Map();

async function deleteMessage(message) {
  const rate = rates.get(message.channel.id) || 0;
  rates.set(message.channel.id, rate + 1);

  setTimeout(() => rates.set(message.channel.id, rates.get(message.channel.id) - 1), 10000);

  const bulk = bulks.get(message.channel.id) || [];
  if (bulk.length) bulk.push(message);
  else if (rate < 5) message.delete();
  else {
    bulks.set(message.channel.id, [ message ]);
    setTimeout(() => {
      message.channel.bulkDelete(bulks.get(message.channel.id));
      bulks.delete(message.channel.id);
    }, 5000);
  }
}

module.exports.deleteMessages = messages => {
  const channel = messages[0].channel;
  if (messages.length == 1) deleteMessage(messages[0]);
  else {
    const rate = rates.get(channel.id) || 0;
    rates.set(channel.id, rate + messages.length);
  
    setTimeout(() => rates.set(channel.id, rates.get(channel.id) - messages.length), 10000);
  
    const bulk = bulks.get(channel.id) || [];
    if (bulk.length) bulk.push(...messages);
    else {
      bulks.set(channel.id, messages);
      setTimeout(() => {
        channel.bulkDelete(bulks.get(channel.id));
        bulks.delete(channel.id);
      }, 5000);
    }
  }
};