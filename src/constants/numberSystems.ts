import { evaluate } from "mathjs";

const numberSystems: {
  [identifier: string]: {
    name: string;
    convert(string: string): number | null;
    format(number: number): string;
  }
} = {
  decimal: {
    name: "Decimal (10-number system) (Default)",
    convert: string => parseInt(string) || null,
    format: number => number.toString(),
  },
  hexadecimal: {
    name: "Hexadecimal (16-number system)",
    convert: string => {
      const converted = parseInt(string, 16) || null;
      if (!converted || converted.toString(16) !== string) return null; // prevents starting with 0s, for example "000FF" = 255 while 255 = "FF"
      return converted;
    },
    format: number => number.toString(16),
  },
  binary: {
    name: "Binary (2-number system)",
    convert: string => {
      const converted = parseInt(string, 2) || null;
      if (!converted || converted.toString(2) !== string) return null; // prevents starting with 0s, for example "00011" = 3 while 3 = "11"
      return converted;
    },
    format: number => number.toString(2),
  },
  roman: {
    name: "Roman (I, II, III, IV, V...)",
    convert: string => {
      const converted = fromRoman(string) || null;
      if (!converted || toRoman(converted) !== string) return null;
      return converted;
    },
    format: number => toRoman(number) || "0",
  },
  math: {
    name: "Math Expression (4*4 = 16)",
    convert: expression => {
      try {
        return evaluate(expression) || null;
      } catch (e) {
        return null;
      }
    },
    format: number => number.toString(),
  },
};

export default numberSystems;

function toRoman(number: number): string {
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

function fromRoman(string: string): number {
  if (string.startsWith("M")) {
    const firstNonM = string.split("").findIndex(char => char !== "M");
    if (firstNonM === -1) return 1000 * string.length;
    return 1000 * firstNonM + fromRoman(string.slice(firstNonM));
  }
  if (string.startsWith("CM")) return 900 + fromRoman(string.substring(2));
  if (string.startsWith("D")) return 500 + fromRoman(string.substring(1));
  if (string.startsWith("CD")) return 400 + fromRoman(string.substring(2));
  if (string.startsWith("C")) return 100 + fromRoman(string.substring(1));
  if (string.startsWith("XC")) return 90 + fromRoman(string.substring(2));
  if (string.startsWith("L")) return 50 + fromRoman(string.substring(1));
  if (string.startsWith("XL")) return 40 + fromRoman(string.substring(2));
  if (string.startsWith("X")) return 10 + fromRoman(string.substring(1));
  if (string.startsWith("IX")) return 9 + fromRoman(string.substring(2));
  if (string.startsWith("V")) return 5 + fromRoman(string.substring(1));
  if (string.startsWith("IV")) return 4 + fromRoman(string.substring(2));
  if (string.startsWith("I")) return 1 + fromRoman(string.substring(1));
  return 0;
}
