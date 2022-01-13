import numberSystems from "../src/constants/numberSystems";

test.each(Object.entries(numberSystems))("test %s system", (name: string) => {
  const { convert, format } = numberSystems[name];

  // valid
  expect(convert(format(123))).toBe(123);
  expect(convert(format(10_000))).toBe(10_000);
  expect(convert(format(1_000_000))).toBe(1_000_000);
  expect(convert(format(1_000_000_000))).toBe(1_000_000_000);

  // invalid
  expect(convert(format(0))).toBe(null);
  expect(convert("******")).toBe(null);
  expect(convert("INVALID")).toBe(null);
  expect(convert("")).toBe(null);
});
