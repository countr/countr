import type { Property } from ".";
import { shortInput } from "./inputs";

const numberPositiveOrNegative: Property<number, string> = {
  name: "Number (Positive or negative)",
  description: "Any positive or negative number. Zero is not allowed.",
  schema: { type: "integer", oneOf: [{ minimum: 1 }, { maximum: -1 }] },
  input: shortInput("positive or negative number"),
  convert: userInput => {
    const number = parseInt(userInput, 10);
    if (isNaN(number) || number === 0) return null;
    return number;
  },
  format: number => number.toString(),
};

export default numberPositiveOrNegative;
