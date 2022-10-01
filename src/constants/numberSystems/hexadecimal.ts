import type { NumberSystem } from ".";

const hexadecimal: NumberSystem = {
  name: "Hexadecimal (16-number system using 0-9 and A-F)",
  convert: input => {
    const converted = parseInt(input, 16);
    if (isNaN(converted) || hexadecimal.format(converted).toLowerCase() !== input.toLowerCase()) return null;
    return converted;
  },
  format: number => number.toString(16),
};

export default hexadecimal;
