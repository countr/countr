const { propertyTypes } = require("./propertyTypes.js");

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
      "check": async ({ message: { content } }, [ regex ]) => (new RegExp(regex)).test(content)
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
      "long": "This will remove everyone from this role.",
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
      "run": async ({ message }) => await message.pin()
    },
    "sendmessage": {
      "short": "Send a message",
      "long": "This will send a message in a channel (it doesn't have to be the counting channel!)",
      "properties": [
        propertyTypes.channel,
        propertyTypes.text
      ],
      "explanation": "Send a message in {0}: ```{1}```",
      "run": async ({ count, score, message: { guild, member, author } }, [ channelID, text ]) => {
        const channel = guild.channels.resolve(channelID);
        if (channel) await channel.send(text
          .replace(/{count}/gi, count)
          .replace(/{mention}/gi, member.toString())
          .replace(/{tag}/gi, author.tag)
          .replace(/{username}/gi, author.username)
          .replace(/{nickname}/gi, member.displayName)
          .replace(/{everyone}/gi, guild.roles.everyone.toString())
          .replace(/{score}/gi, score)
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