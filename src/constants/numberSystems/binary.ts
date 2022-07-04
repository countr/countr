import type { NumberSystem } from ".";

const binary: NumberSystem = {
  name: "Binary (2-number system using 0-1)",
  convert: input => {
    const converted = parseInt(input, 2);
    if (isNaN(converted) || binary.format(converted) !== input) return null;
    return converted;
  },
  format: number => number.toString(2),
};

export default binary;
