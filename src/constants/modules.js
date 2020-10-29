module.exports.modules = {
  "allow-spam": {
    "short": "Allow people to count multiple times in a row."
  },
  "recover": {
    "short": "Remove invalid messages when the bot restarts."
  },
  "reposting": {
    "short": "Repost the message.",
    "incompatible": [
      "webhook"
    ]
  },
  "talking": {
    "short": "Allow people to send text after the count."
  },
  "webhook": {
    "short": "Repost the message in a webhook.",
    "incompatible": [
      "reposting"
    ]
  }
}

for (const i in module.exports.modules) module.exports.modules[i] = Object.assign({
  "short": "N/A",
  "long": null,
  "image": null,
  "incompatible": []
}, module.exports.modules[i])