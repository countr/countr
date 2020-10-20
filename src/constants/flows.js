const { getRole, getChannel } = require("./resolvers.js")

module.exports = {
  limitTriggers: 1,
  limitActions: 3,
  limitFlows: 5
}

module.exports.propertyTypes = {
  "numberX": {
    "short": "Number (X)",
    "convert": parseInt,
    "format": async n => n
  },
  "role": {
    "short": "Role",
    "convert": async (search, { guild }) => {
      const result = await getRole(search, guild);
      if (result) return result.id; else return null;
    },
    "format": async roleid => `<&${roleid}>`
  },
  "channel": {
    "short": "Channel",
    "convert": async (search, { guild }) => {
      const result = await getChannel(search, guild);
      if (result) return result.id; else return null;
    },
    "format": async channelid => `<#${channelid}>`
  },
  "text": {
    "short": "Text",
    "convert": async m => m,
    "format": async text => text
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
        module.exports.propertyTypes.message
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