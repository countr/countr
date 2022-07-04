import numberSystems from ".";

test.each(Object.keys(numberSystems))("test %s system", (name: string) => {
  const { convert, format } = numberSystems[name as unknown as keyof typeof numberSystems];

  // valid
  expect(convert(format(+1_000_000_000))).toBe(+1_000_000_000);
  expect(convert(format(+1_000_000))).toBe(+1_000_000);
  expect(convert(format(+1_000))).toBe(+1_000);
  expect(convert(format(0))).toBe(0);
  expect(convert(format(-1_000))).toBe(-1_000);
  expect(convert(format(-1_000_000))).toBe(-1_000_000);
  expect(convert(format(-1_000_000_000))).toBe(-1_000_000_000);

  // it will be hard to make invalid tests as the number systems are different from each other
});
