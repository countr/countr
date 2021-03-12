const { msToTime } = require("../../constants/index.js");

module.exports = {
  description: "Get the latency of the bot.",
  options: []
};

module.exports.run = async (send, { client }) => send({ content: `🏓 API latency is \`${Math.round(client.ws.ping)}ms\` and my uptime is \`${msToTime(client.uptime)}\`.` });