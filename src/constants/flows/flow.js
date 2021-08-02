const { propertyTypes } = require("./propertyTypes.js"), RE2 = require("re2");

module.exports.flow = {
  triggers: {
    "each": {
      "short": "Each X number",
      "long": "This will get triggered whenever a user counts a multiple of X. For example, if X is 10, this will trigger on 10, 20, 30 etc.",
      "properties": [
        propertyTypes.numberX
      ],
      "explanation": "When someone counts a multiplication of {0}",
      "check": async ({ count }, [ number ]) => count % number == 0
    },
    "only": {
      "short": "Only number X",
      "long": "This will get triggered whenever a user counts the number X, and only the number X.",
      "properties": [
        propertyTypes.numberX
      ],
      "explanation": "When someone counts the number {0}",
      "check": async ({ count }, [ number ]) => count == number
    },
    "score": {
      "short": "Score of X",
      "long": "This will get triggered whenever a user has counted a total of X counts.",
      "properties": [
        propertyTypes.numberX
      ],
      "explanation": "When someone gets a score of {0}",
      "check": async ({ score }, [ number ]) => score == number
    },
    "regex": {
      "short": "Regex match",
      "long": "This will get triggered when a count matches a regex.",
      "properties": [
        propertyTypes.regex
      ],
      "explanation": "When a message matches the regex `{0}`",
      "check": async ({ message: { content } }, [ regex ]) => (new RE2(regex)).test(content)
    },
    "countfail": {
      "short": "Count fail",
      "long": "This will get triggered whenever someone fails a count",
      "explanation": "When someone fails to count the correct number",
      "check": async () => {} // custom
    },
    "timeout": {
      "short": "Timeout role triggered",
      "long": "This will get triggered whenever someone gets the timeout role.",
      "explanation": "When someone gets the timeout role",
      "check": async () => {} // custom
    }
  },
  actions: {
    "giverole": {
      "short": "Give a role to the user",
      "long": "This will add a role to the user who triggered this flow.",
      "properties": [
        propertyTypes.role
      ],
      "explanation": "Add the user to {0}",
      "run": async ({ message: { member } }, [ roleID ]) => await member.roles.add(roleID).catch()
    },
    "takerole": {
      "short": "Take a role away from the user",
      "long": "This will remove a role from the user who triggered this flow.",
      "properties": [
        propertyTypes.role
      ],
      "explanation": "Remove the user from {0}",
      "run": async ({ message: { member } }, [ roleID ]) => await member.roles.remove(roleID).catch()
    },
    "prunerole": {
      "short": "Remove everyone from a role",
      "long": "This will remove everyone from this role.\nNote: This might not remove everyone from the role due to caching. Some inactive users might not lose their role.",
      "properties": [
        propertyTypes.role
      ],
      "explanation": "Remove everyone from {0}",
      "run": async ({ message: { guild } }, [ roleID ]) => {
        const role = guild.roles.resolve(roleID);
        if (role) await Promise.all(role.members.map(async member => await member.roles.remove(roleID).catch()));
      }
    },
    "pin": {
      "short": "Pin the count message",
      "explanation": "Pin the count",
      "run": async ({ countingMessage }) => await countingMessage.pin().catch(async () => {
        let pinned = await countingMessage.channel.messages.fetchPinned(false).catch(() => ({ size: 0 }));
        if (pinned.size == 50) await pinned.last().unpin().then(() => countingMessage.pin().catch()).catch();
      })
    },
    "sendmessage": {
      "short": "Send a message",
      "long": "This will send a message in a channel (it doesn't have to be the counting channel!)",
      "properties": [
        propertyTypes.channel,
        propertyTypes.text
      ],
      "explanation": "Send a message in {0}: ```{1}```",
      "run": async ({ count, score, message: { guild, member, author, content } }, [ channelID, text ]) => {
        const channel = guild.channels.resolve(channelID);
        if (channel) await channel.send(text
          .replace(/{count}/gi, count)
          .replace(/{mention}/gi, member.toString())
          .replace(/{tag}/gi, author.tag)
          .replace(/{username}/gi, author.username)
          .replace(/{nickname}/gi, member.displayName)
          .replace(/{everyone}/gi, guild.roles.everyone.toString())
          .replace(/{score}/gi, score)
          .replace(/{content}/gi, content)
        , {
          disableMentions: "none"
        }).catch();
      }
    },
    "lock": {
      "short": "Lock the counting channel",
      "long": "This will lock the counting channel for the everyone-role, and will be read-only.",
      "explanation": "Lock the counting channel",
      "run": async ({ message: { channel, guild } }) => await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: false }).catch()
    },
    "reset": {
      "short": "Reset the current count",
      "explanation": "Reset the count to 0",
      "run": async ({ gdb }) => gdb.set("count", 0)
    }
  }
};

for (const i in module.exports.flow.triggers) module.exports.flow.triggers[i] = Object.assign({
  "short": "N/A",
  "long": null,
  "properties": [],
  "explanation": "N/A",
  "check": async any => any
}, module.exports.flow.triggers[i]);

for (const i in module.exports.flow.actions) module.exports.flow.actions[i] = Object.assign({
  "short": "N/A",
  "long": null,
  "properties": [],
  "explanation": "N/A",
  "run": async () => null
}, module.exports.flow.actions[i]);
