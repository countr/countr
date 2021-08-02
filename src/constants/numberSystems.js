const { toArabic, toRoman } = require("roman-numerals"), { evaluate } = require("mathjs");

module.exports = {
  "decimal": {
    name: "Decimal (10-number system) (Default)",
    convert: (string = new String) => parseInt(string),
    format: (number = new Number) => number.toString()
  },
  "hexadecimal": {
    name: "Hexadecimal (16-number system)",
    convert: (string = new String) => {
      const converted = parseInt(string, 16);
      if (!converted || converted.toString(16) !== string) return null; // prevents starting with 0s, for example "000FF" = 255 while 255 = "FF"
      return converted;
    },
    format: (number = new Number) => number.toString(16)
  },
  "binary": {
    name: "Binary (2-number system)",
    convert: (string = new String) => {
      const converted = parseInt(string, 2);
      if (!converted || converted.toString(2) !== string) return null; // prevents starting with 0s, for example "00011" = 3 while 3 = "11"
      return converted;
    },
    format: (number = new Number) => number.toString(2)
  },
  "roman": {
    name: "Roman (I, II, III, IV, V...)",
    convert: (string = new String) => {
      try {
        return toArabic(string);
      } catch(e) {
        return null;
      }
    },
    format: toRoman
  },
  "math": {
    name: "Math Expression (4*4 = 16)",
    convert: evaluate,
    format: (number = new Number) => number.toString()
  }
};