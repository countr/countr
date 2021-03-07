const config = require("../../../config.json");

module.exports = Object.assign(
  config.isPremium ? {
    limitTriggers: 25,
    limitActions: 25,
    limitFlows: 25
  } : {
    limitTriggers: 3,
    limitActions: 10,
    limitFlows: 15
  },
  require("./flow.js"),
  require("./propertyTypes.js"),
  require("./walkthrough.js")
);