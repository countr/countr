import { formatListToHuman, handlePlural } from "./text";

// https://stackoverflow.com/a/6117889
export function getWeek(date = new Date()): number {
  const dateNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  dateNoTime.setUTCDate(dateNoTime.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(dateNoTime.getUTCFullYear(), 0, 1);
  return Math.ceil(((dateNoTime.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// https://stackoverflow.com/a/23593099
export function getDateTimestamp(date = new Date()): number {
  const dateNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  dateNoTime.setUTCDate(dateNoTime.getUTCDate() + 4 - (date.getUTCDay() || 7));
  return dateNoTime.getTime();
}

// https://stackoverflow.com/a/19700358
export function msToHumanShortTime(ms: number): string {
  const days = Math.floor(ms / 86400000);
  const daysMs = ms % 86400000;
  const hours = Math.floor(daysMs / 3600000);
  const hoursMs = daysMs % 3600000;
  const minutes = Math.floor(hoursMs / 60000);
  const minutesMs = hoursMs % 60000;
  const seconds = Math.floor(minutesMs / 1000);

  let str = "";
  if (days) str += `${days}d`;
  if (hours) str += `${hours}h`;
  if (minutes) str += `${minutes}m`;
  if (seconds) str += `${seconds}s`;
  return str || "0s";
}

export function msToHumanTime(ms: number): string {
  const days = Math.floor(ms / 86400000);
  const daysMs = ms % 86400000;
  const hours = Math.floor(daysMs / 3600000);
  const hoursMs = daysMs % 3600000;
  const minutes = Math.floor(hoursMs / 60000);
  const minutesMs = hoursMs % 60000;
  const seconds = Math.floor(minutesMs / 1000);

  const str = [];
  if (days) str.push(handlePlural(days, "day"));
  if (hours) str.push(handlePlural(hours, "hour"));
  if (minutes) str.push(handlePlural(minutes, "minute"));
  if (seconds) str.push(handlePlural(seconds, "second"));
  return formatListToHuman(str) || "0 seconds";
}

export function msToHumanSeconds(ms: number): string {
  return `${Math.ceil(ms / 1000).toLocaleString("en-US")}s`;
}
