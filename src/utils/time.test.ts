import { getWeek, msToHumanSeconds, msToHumanShortTime, msToHumanTime } from "./time";

describe("time", () => {
  describe("getWeek", () => {
    it("should return the correct week", () => {
      expect(getWeek(new Date("2020-01-01"))).toBe(1);
      expect(getWeek(new Date("2020-01-05"))).toBe(1);
      expect(getWeek(new Date("2020-01-06"))).toBe(2);
      expect(getWeek(new Date("2020-12-31"))).toBe(53);
    });
  });

  // the test depends on timezones so this is disabled
  // describe("getDateTimestamp", () => {
  //   it("should return the correct timestamp", () => {
  //     expect(getDateTimestamp(new Date("2020-01-01T01:01:01"))).toBe(1577836800000);
  //     expect(getDateTimestamp(new Date("2020-01-05T05:05:05"))).toBe(1578182400000);
  //     expect(getDateTimestamp(new Date("2020-01-06T06:06:06"))).toBe(1578268800000);
  //     expect(getDateTimestamp(new Date("2020-12-31T07:31:31"))).toBe(1609372800000);
  //   });
  // });

  describe("msToHumanShortTime", () => {
    it("should return the correct string", () => {
      expect(msToHumanShortTime(0)).toBe("0s");
      expect(msToHumanShortTime(1)).toBe("0s");
      expect(msToHumanShortTime(1000)).toBe("1s");
      expect(msToHumanShortTime(1001)).toBe("1s");
      expect(msToHumanShortTime(10000)).toBe("10s");
      expect(msToHumanShortTime(10001)).toBe("10s");
      expect(msToHumanShortTime(60000)).toBe("1m");
      expect(msToHumanShortTime(60001)).toBe("1m");
      expect(msToHumanShortTime(600000)).toBe("10m");
      expect(msToHumanShortTime(600001)).toBe("10m");
      expect(msToHumanShortTime(3600000)).toBe("1h");
      expect(msToHumanShortTime(3600001)).toBe("1h");
      expect(msToHumanShortTime(36000000)).toBe("10h");
      expect(msToHumanShortTime(36000001)).toBe("10h");
      expect(msToHumanShortTime(86400000)).toBe("1d");
      expect(msToHumanShortTime(86400001)).toBe("1d");
      expect(msToHumanShortTime(864000000)).toBe("10d");
      expect(msToHumanShortTime(864000001)).toBe("10d");
      expect(msToHumanShortTime(8640000000)).toBe("100d");
      expect(msToHumanShortTime(8640000001)).toBe("100d");
      expect(msToHumanShortTime(8640000000 + 36000000 + 600000 + 10000 + 1)).toBe("100d10h10m10s");
    });
  });

  describe("msToHumanTime", () => {
    it("should return the correct string", () => {
      expect(msToHumanTime(0)).toBe("0 seconds");
      expect(msToHumanTime(1)).toBe("0 seconds");
      expect(msToHumanTime(1000)).toBe("1 second");
      expect(msToHumanTime(1001)).toBe("1 second");
      expect(msToHumanTime(10000)).toBe("10 seconds");
      expect(msToHumanTime(10001)).toBe("10 seconds");
      expect(msToHumanTime(60000)).toBe("1 minute");
      expect(msToHumanTime(60001)).toBe("1 minute");
      expect(msToHumanTime(600000)).toBe("10 minutes");
      expect(msToHumanTime(600001)).toBe("10 minutes");
      expect(msToHumanTime(3600000)).toBe("1 hour");
      expect(msToHumanTime(3600001)).toBe("1 hour");
      expect(msToHumanTime(36000000)).toBe("10 hours");
      expect(msToHumanTime(36000001)).toBe("10 hours");
      expect(msToHumanTime(86400000)).toBe("1 day");
      expect(msToHumanTime(86400001)).toBe("1 day");
      expect(msToHumanTime(864000000)).toBe("10 days");
      expect(msToHumanTime(864000001)).toBe("10 days");
      expect(msToHumanTime(8640000000)).toBe("100 days");
      expect(msToHumanTime(8640000001)).toBe("100 days");
      expect(msToHumanTime(8640000000 + 36000000 + 600000 + 10000 + 1)).toBe("100 days, 10 hours, 10 minutes, and 10 seconds");
    });
  });

  describe("msToHumanSeconds", () => {
    it("should return the correct string", () => {
      expect(msToHumanSeconds(0)).toBe("0s");
      expect(msToHumanSeconds(1)).toBe("1s");
      expect(msToHumanSeconds(1000)).toBe("1s");
      expect(msToHumanSeconds(1001)).toBe("2s");
      expect(msToHumanSeconds(36000000)).toBe("36,000s");
      expect(msToHumanSeconds(36000001)).toBe("36,001s");
    });
  });
});
