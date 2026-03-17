import type { Property } from ".";
import { shortInput } from "./inputs";

const numberPositive: Property<number, string> = {
  name: "Number (Positive)",
  description: "Any positive number. Zero is not allowed.",
  schema: { type: "integer", minimum: 1 },
  input: shortInput("positive number"),
  convert: userInput => {
    const number = parseInt(userInput, 10);
    if (isNaN(number) || number < 1) return null;
    return number;
  },
  format: number => number.toString(),
};

export default numberPositive;
