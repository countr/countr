// convert a date to YY-MM-DD format
module.exports.getDateFormatted = d => { // https://stackoverflow.com/a/23593099
  let month = (d.getMonth() + 1).toString(), day = d.getDate().toString(), year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
};

// milliseconds to time converter
module.exports.msToTime = ms => {
  const
    days = Math.floor(ms / 86400000), // 24*60*60*1000
    daysms = ms % 86400000, // 24*60*60*1000
    hours = Math.floor(daysms / 3600000), // 60*60*1000
    hoursms = ms % 3600000, // 60*60*1000
    minutes = Math.floor(hoursms / 60000), // 60*1000
    minutesms = ms % 60000, // 60*1000
    sec = Math.floor(minutesms / 1000);

  let str = "";
  if (days) str = str + days + "d";
  if (hours) str = str + hours + "h";
  if (minutes) str = str + minutes + "m";
  if (sec) str = str + sec + "s";

  return str || "0s";
};