module.exports.tips = [
  "Want more flows? Go premium!",
  "Do `{prefix}set <count>` to set the count.",
  "Do `{prefix}module allow-spam on` to allow people to count multiple times.",
  "Do `{prefix}module recover on` to remove invalid messages after a bot restart.",
  "Do `{prefix}module webhook` to avoid self-deleting.",
  "Don't know how to set up? Do `{prefix}setup`.",
  "Want people to be able to send a message after the count? Do `{prefix}module talking on`.",
  "Check the documentation out for more ways to customize your server. <https://docs.countr.xyz/>",
  "Curious about how your data is stored and handeled? Check out our Privacy Policy! <https://countr.xyz/privacy>"
];

module.exports.generateTip = prefix => `**Tip:** ${this.tips[Math.floor(Math.random() * this.tips.length)].replace(/{prefix}/g, prefix)}`;