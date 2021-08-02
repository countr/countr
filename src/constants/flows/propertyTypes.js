const { getRole, getChannel } = require("../resolvers.js"), RE2 = require("re2");

module.exports.propertyTypes = {
  "numberX": {
    "short": "Number (X)",
    "help": "This can be any positive number.",
    "convert": async num => parseInt(num) || null
  },
  "regex": {
    "short": "Regex",
    "help": "Get help on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices",
    "convert": async regex => {
      try {
        new RE2(regex);
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
      if (result && result.id !== guild.id) return result.id; else return null;
    },
    "format": async roleid => `<@&${roleid}>`
  },
  "channel": {
    "short": "Channel",
    "help": "Any channel. Make sure Countr has access to the channel, and that it is a text based channel. (news channels also work)",
    "convert": async (search, { guild }) => {
      const result = await getChannel(search, guild);
      if (result && result.name !== "countr-flow-editor") return result.id; else return null;
    },
    "format": async channelid => `<#${channelid}>`
  },
  "text": {
    "short": "Text",
    "help": [
      "Any text. Get creative with these placeholders:",
      "• `{count}` The count that triggered this flow",
      "• `{mention}` Mentions the user who triggered this flow",
      "• `{tag}` The tag of the user who triggered this flow",
      "• `{username}` The username of the user who triggered this flow",
      "• `{nickname}` The nickname of the user who triggered this flow",
      "• `{everyone}` Mentions the everyone-role",
      "• `{score}` The new score of the user who triggered this flow",
      "• `{content}` The content of the message that triggered this flow"
    ].join("\n")
  }
};

for (const i in module.exports.propertyTypes) module.exports.propertyTypes[i] = Object.assign({
  "short": "N/A",
  "help": null,
  "convert": async any => any,
  "format": async any => any
}, module.exports.propertyTypes[i]);
