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
    "convert": parseInt
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
    "format": async roleid => `<&${roleid}>`
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

for (const i in module.exports.propertyTypes) module.exports.propertyTypes[i] = Object.assign({
  "short": "N/A",
  "help": null,
  "convert": async any => any,
  "format": async any => any
}, module.exports.propertyTypes[i])

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