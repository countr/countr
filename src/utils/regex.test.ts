import { matchRegex } from "./regex";

describe("regex", () => {
  describe("matchRegex", () => {
    it("should not time out with a valid regex", async () => {
      const testRegex = "^[a-zA-Z0-9]{1,32}$";
      await matchRegex(testRegex, "abc123").then(result => expect(result).toBe(true));
      await matchRegex(testRegex, "").then(result => expect(result).toBe(false));
    });

    it("should time out when ReDOS'd", async () => {
      const testRegex = "((a+)+)+$";
      await matchRegex(testRegex, `${"a".repeat(10_000)}!`).then(result => expect(result).toBe(null));
    }, 10_000);
  });
});
