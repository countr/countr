import { toArabic, toRoman } from "roman-numerals";
import { evaluate } from "mathjs";

const numberSystems: {
  [identifier: string]: {
    name: string;
    convert(string: string): number | null;
    format(number: number): string;
  }
} = {
  "decimal": {
    name: "Decimal (10-number system) (Default)",
    convert: (string) => parseInt(string) || null,
    format: (number) => number.toString()
  },
  "hexadecimal": {
    name: "Hexadecimal (16-number system)",
    convert: (string) => {
      const converted = parseInt(string, 16) || null;
      if (!converted || converted.toString(16) !== string) return null; // prevents starting with 0s, for example "000FF" = 255 while 255 = "FF"
      return converted;
    },
    format: (number) => number.toString(16)
  },
  "binary": {
    name: "Binary (2-number system)",
    convert: (string) => {
      const converted = parseInt(string, 2) || null;
      if (!converted || converted.toString(2) !== string) return null; // prevents starting with 0s, for example "00011" = 3 while 3 = "11"
      return converted;
    },
    format: (number) => number.toString(2)
  },
  "roman": {
    name: "Roman (I, II, III, IV, V...)",
    convert: (string) => {
      try {
        return toArabic(string);
      } catch (e) {
        return null;
      }
    },
    format: toRoman
  },
  "math": {
    name: "Math Expression (4*4 = 16)",
    convert: evaluate,
    format: (number) => number.toString()
  }
};

export default numberSystems;
