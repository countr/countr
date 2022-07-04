import type { NumberSystem } from ".";

const decimal: NumberSystem = {
  name: "Decimal (Standard 10-number system using 0-9)",
  convert: input => {
    const converted = parseInt(input, 10);
    if (isNaN(converted) || decimal.format(converted) !== input) return null;
    return converted;
  },
  format: number => number.toString(),
};

export default decimal;
