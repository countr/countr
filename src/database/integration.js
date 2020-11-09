const config = require("../../config.json"), fetch = require("node-fetch");

module.exports = (counts, week) => {
  // webhook integration
  if (config.webhookUrl) fetch(config.webhookUrl, {
    method: "POST",
    body: JSON.stringify({ value1: counts.toString(), value2: week.toString() }), // simple to integrate with IFTTT!
    headers: { "Content-Type": "application/json" }
  });
};