import type { NumberSystem } from ".";

const base64: NumberSystem = {
  name: "Base64 (64-number system using A-Z, a-z, 0-9, +, /, and =)",
  convert: input => {
    const converted = parseInt(Buffer.from(input, "base64").toString("ascii"), 10);
    if (isNaN(converted) || base64.format(converted) !== input) return null;
    return converted;
  },
  format: number => {
    const buffer = Buffer.from(number.toString());
    return buffer.toString("base64");
  },
};

export default base64;
