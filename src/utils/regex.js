const { filters: { timeout } } = require("../constants/limits.js"), { match } = require("time-limited-regular-expressions")({ limit: timeout });

module.exports = match;