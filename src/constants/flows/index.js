module.exports = Object.assign({
  limitTriggers: 1,
  limitActions: 3,
  limitFlows: 5
}, require("./flow.js"), require("./propertyTypes.js"), require("./walkthrough.js"));