const mongoose = require("mongoose"), integration = require("./integration.js");

const pendingCounts = 0;

const globalSchema = mongoose.Schema({ counts: 0, week: getWeek(new Date()) }, { minimize: false }) 
const Global = mongoose.model("Global", globalSchema)

setInterval(() => Global.findOne({}, (err, stats) => {
  if (err) return reject(err);
  const thisWeek = getWeek(new Date())

  if (!stats) stats = new Global({ counts: 0, week })

  stats.counts += pendingCounts;
  pendingCounts = 0;

  if (stats.week !== thisWeek) {
    integration({ counts: stats.counts, week: stats.week });
    stats.counts = 0;
    stats.week = thisWeek;
  }

  stats.save();
}), 120000)

module.exports = {
  addCount: () => pendingCounts++,
  getCount: () => new Promise((resolve, reject) => Global.findOne({}, (err, stats) => {
    if (err) return reject(err);
    return resolve(stats.counts + pendingCounts)
  }))
}

function getWeek(d) { // https://stackoverflow.com/a/6117889
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let week = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);

  return week;
}