import Global from "../database/models/Global";
import config from "../config";
import { getWeek } from "../utils/time";
import superagent from "superagent";

let newCounts = 0, globalCounts = 0;

export function addToCount(n: number): void {
  newCounts += n;
}

export function getGlobalCount(): number {
  return newCounts + globalCounts;
}

setInterval(async () => {
  let g = await Global.findOne();
  if (!g) g = new Global();

  const week = getWeek();
  if (week !== g.week) {
    if (config.integration.webhookUrl) {
      superagent
        .post(config.integration.webhookUrl)
        .send({
          value1: `${g.counts}`,
          value2: `${g.week}`,
        })
        .end();
    }

    g.counts = newCounts;
    g.week = week;
  } else g.counts += newCounts;

  newCounts = 0;
  globalCounts = g.counts;

  g.save();
}, 15000);
