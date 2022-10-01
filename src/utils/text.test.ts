import {
  capitalizeFirst,
  fitText,
  formatListToHuman,
  handlePlural,
} from "./text";

describe("text", () => {
  describe("fitText", () => {
    it("should return the string if it is shorter than the length", () => {
      expect(fitText("hello", 10)).toBe("hello");
    });

    it("should return the string if it is equal to the length", () => {
      expect(fitText("hello", 5)).toBe("hello");
    });

    it("should return the string if it is shorter than the length and includeTrail is false", () => {
      expect(fitText("hello", 10, false)).toBe("hello");
    });

    it("should cut the string if it is longer than the length and includeTrail is false", () => {
      expect(fitText("hello", 4, false)).toBe("hell");
    });

    it("should handle trail", () => {
      expect(fitText("hello", 4)).toBe("hel…");
    });
  });

  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalizeFirst("hello")).toEqual("Hello");
      expect(capitalizeFirst("Hello")).toEqual("Hello");
      expect(capitalizeFirst("")).toEqual("");
    });
  });

  describe("formatListToHuman", () => {
    it("should return the string if it's the only one", () => {
      expect(formatListToHuman(["hello"])).toBe("hello");
    });

    it("should return and between the only two strings", () => {
      expect(formatListToHuman(["hello", "world"])).toBe("hello, and world");
    });

    it("should return and between the last two strings", () => {
      expect(formatListToHuman(["hello", "world", "foo"])).toBe(
        "hello, world, and foo",
      );
    });
  });

  describe("handlePlural", () => {
    it("should handle singular", () => {
      expect(handlePlural(1, "cat")).toBe("1 cat");
    });

    it("should handle plural", () => {
      expect(handlePlural(2, "cat")).toBe("2 cats");
    });
  });
});
