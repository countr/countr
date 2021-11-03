export const getWeek = (d_ = new Date()): number => { // https://stackoverflow.com/a/6117889
  const d = new Date(Date.UTC(d_.getFullYear(), d_.getMonth(), d_.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return week;
};

export const getDateFormatted = (d = new Date()): string => { // https://stackoverflow.com/a/23593099
  let month = (d.getMonth() + 1).toString(), day = d.getDate().toString();
  const year = d.getFullYear();
  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  return [year, month, day].join("-");
};

export const msToTime = (ms: number): string => { // https://stackoverflow.com/a/19700358
  const
    days = Math.floor(ms / 86400000), // 24*60*60*1000
    daysms = ms % 86400000, // 24*60*60*1000
    hours = Math.floor(daysms / 3600000), // 60*60*1000
    hoursms = ms % 3600000, // 60*60*1000
    minutes = Math.floor(hoursms / 60000), // 60*1000
    minutesms = ms % 60000, // 60*1000
    sec = Math.floor(minutesms / 1000);

  let str = "";
  if (days) str = `${str + days}d`;
  if (hours) str = `${str + hours}h`;
  if (minutes) str = `${str + minutes}m`;
  if (sec) str = `${str + sec}s`;

  return str || "0s";
};
