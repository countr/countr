import type { NumberSystem } from ".";

const base36: NumberSystem = {
  name: "Base36 (36-number system using 0-9 and A-Z)",
  convert: input => {
    const converted = parseInt(input, 36);
    if (isNaN(converted) || base36.format(converted).toLowerCase() !== input.toLowerCase()) return null;
    return converted;
  },
  format: number => number.toString(36),
};

export default base36;
