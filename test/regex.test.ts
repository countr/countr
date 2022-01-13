import regex from "../src/utils/regex";

it("should not time out with a valid regex", async () => {
  const testRegex = "^[a-zA-Z0-9]{1,32}$";
  await regex(testRegex, "abc123").then(result => expect(result).toBe(true));
  await regex(testRegex, "").then(result => expect(result).toBe(false));
});

it("should time out when ReDOS'd", async () => {
  const testRegex = "((a+)+)+$";
  await expect(regex(testRegex, `${"a".repeat(10_000)}!`)).resolves.toBe(null);
}, 10_000);
