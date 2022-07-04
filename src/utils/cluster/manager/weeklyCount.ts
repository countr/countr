import { getGlobalDocument } from "../../../database";
import { getWeek } from "../../time";
import integrations from "./integrations";

let weeklyCountNotAdded = 0;
export function addToWeeklyCount(number: number): void {
  weeklyCountNotAdded += number;
}

let weeklyCount = 0;
export function getWeeklyCount(): number {
  return weeklyCount + weeklyCountNotAdded;
}

// update database with count and update presence
setInterval(() => void getGlobalDocument().then(globalDb => {
  const currentWeek = getWeek();
  if (globalDb.week !== currentWeek) {
    integrations(globalDb.counts, globalDb.week);
    globalDb.week = currentWeek;
  }

  globalDb.counts += weeklyCountNotAdded;
  weeklyCount = globalDb.counts;
  weeklyCountNotAdded = 0;
  void globalDb.save();
}), 60000);
