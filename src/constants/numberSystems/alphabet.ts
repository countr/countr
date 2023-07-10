import type { NumberSystem } from ".";

const alphabet: NumberSystem = {
  name: "Alphabet (A-Z)",
  convert: input => {
    if (input === "0") return 0;
    if (input.startsWith("-")) {
      const converted = alphabet.convert(input.slice(1));
      return converted === null ? null : -converted;
    }

    const converted = input
      .toUpperCase()
      .split("")
      .map(char => char.charCodeAt(0) - 64);
    if (converted.some(char => char < 1 || char > 26)) return null;
    return converted.reduce((a, b) => a * 26 + b, 0);
  },
  format: number => {
    if (number === 0) return "0";

    let startNumber = number < 0 ? -number : number;
    let converted = "";
    while (startNumber > 0) {
      const remainder = startNumber % 26;
      converted = String.fromCharCode(remainder + 64) + converted;
      startNumber = (startNumber - remainder) / 26;
    }
    return (number < 0 ? "-" : "") + converted || "0";
  },
};

export default alphabet;
