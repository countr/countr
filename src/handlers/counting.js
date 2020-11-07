const { getPermissionLevel, limitFlows, flow: { triggers: allTriggers, actions: allActions }, limitTriggers, limitActions } = require("../constants/index.js"), config = require("../../config.json"), countingFails = new Map();

module.exports = async (message, gdb) => {
  const permissionLevel = getPermissionLevel(message.member);

  if (message.content.startsWith("!") && permissionLevel >= 1) return;

  let { count, user, modules, regex, notifications, flows, users: scores, timeoutrole } = gdb.get(), regexMatches = false;
  if (regex.length && permissionLevel == 0)
    for (let r of regex)
      if ((new RegExp(r, "g")).test(message.content)) {
        regexMatches = true;
        break;
      }
  
  if (
    regexMatches ||
    (!modules.includes("allow-spam") && message.author.id == user) ||
    (!modules.includes("talking") && message.content !== (count + 1).toString()) ||
    message.content.split(" ")[0] !== (count + 1).toString()
  ) {
    deleteMessage(message);
    if (timeoutrole.role) {
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
        } catch(e) { /* something went wrong */ }
      }
    }
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

  gdb.set("message", countingMessage.id);

  for (const notifID in notifications) {
    const notif = notifications[notifID];
    if (notif && (
      notif.mode == "only" && notif.count == count ||
      notif.mode == "each" && notif.count % count == 0
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
      message
    }, flowIDs = Object.keys(flows).slice(0, limitFlows);
  for (const flowID of flowIDs) {
    const flow = flows[flowID]; let success;
    for (const trigger of flow.triggers.slice(0, limitTriggers).filter(t => t)) {
      success = await allTriggers[trigger.type].check(countData, trigger.data);
      if (success) break;
    }
    if (success)
      for (const action of flow.actions.slice(0, limitActions).filter(a => a))
        await allActions[action.type].run(countData, action.data);
  }
};

const bulks = new Map(), timestamps = new Map();

async function deleteMessage(message, skipImmediateDeletion = false) {
  const timestamp = timestamps.get(message.channel.id) || 0;
  timestamps.set(message.channel.id, Date.now() + 2500);
  if (timestamp < new Date() && !skipImmediateDeletion) return message.delete();
  else {
    if (!bulks.get(message.channel.id)) bulks.set(message.channel.id, []);
    const bulk = bulks.get(message.channel.id);

    if (bulk.length == 100) {
      message.channel.bulkDelete(bulk);
      bulks.set(message.channel.id, []);
    } else if (!bulk.length) setTimeout(() => {
      if (bulk.length == 1) bulk[0].delete();
      else message.channel.bulkDelete(bulk);
      bulks.set(message.channel.id, []);
    }, 5000);
    bulk.push(message);
  }
}

module.exports.deleteCommand = messages => Promise.all(messages.map(m => deleteMessage(m, messages.length > 1 ? true : false)));