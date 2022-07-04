import type { NumberSystem } from ".";

const roman: NumberSystem = {
  name: "Roman (I, II, III, IV, V...)",
  convert: input => {
    const converted = fromRoman(input);
    if (isNaN(converted) || roman.format(converted) !== input) return null;
    return converted;
  },
  format: number => toRoman(number) || "nulla",
};

export default roman;

function fromRoman(input: string): number {
  if (input.startsWith("-")) return -fromRoman(input.slice(1));
  if (input.startsWith("M")) {
    const firstNonM = input.split("").findIndex(char => char !== "M");
    if (firstNonM === -1) return 1000 * input.length;
    return 1000 * firstNonM + fromRoman(input.slice(firstNonM));
  }
  if (input.startsWith("CM")) return 900 + fromRoman(input.substring(2));
  if (input.startsWith("D")) return 500 + fromRoman(input.substring(1));
  if (input.startsWith("CD")) return 400 + fromRoman(input.substring(2));
  if (input.startsWith("C")) return 100 + fromRoman(input.substring(1));
  if (input.startsWith("XC")) return 90 + fromRoman(input.substring(2));
  if (input.startsWith("L")) return 50 + fromRoman(input.substring(1));
  if (input.startsWith("XL")) return 40 + fromRoman(input.substring(2));
  if (input.startsWith("X")) return 10 + fromRoman(input.substring(1));
  if (input.startsWith("IX")) return 9 + fromRoman(input.substring(2));
  if (input.startsWith("V")) return 5 + fromRoman(input.substring(1));
  if (input.startsWith("IV")) return 4 + fromRoman(input.substring(2));
  if (input.startsWith("I")) return 1 + fromRoman(input.substring(1));
  return 0;
}

function toRoman(number: number): string {
  if (number < 0) return `-${toRoman(-number)}`;
  if (number >= 1000) return `${"M".repeat(Math.floor(number / 1000))}${toRoman(number % 1000)}`;
  if (number >= 900) return `CM${toRoman(number - 900)}`;
  if (number >= 500) return `D${toRoman(number - 500)}`;
  if (number >= 400) return `CD${toRoman(number - 400)}`;
  if (number >= 100) return `C${toRoman(number - 100)}`;
  if (number >= 90) return `XC${toRoman(number - 90)}`;
  if (number >= 50) return `L${toRoman(number - 50)}`;
  if (number >= 40) return `XL${toRoman(number - 40)}`;
  if (number >= 10) return `X${toRoman(number - 10)}`;
  if (number >= 9) return "IX";
  if (number >= 5) return `V${toRoman(number - 5)}`;
  if (number >= 4) return "IV";
  if (number >= 1) return `I${toRoman(number - 1)}`;
  return "";
}
