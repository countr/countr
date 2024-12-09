import type { Property } from ".";
import { shortInput } from "./inputs";

const numberPositiveOrZero: Property<number, string> = {
  name: "Number (Positive or zero)",
  description: "Any positive number, or zero",
  schema: { type: "integer", minimum: 0 },
  input: shortInput("positive number or zero"),
  convert: userInput => {
    const number = parseInt(userInput, 10);
    if (isNaN(number) || number < 0) return null;
    return number;
  },
  format: number => number.toString(),
};

export default numberPositiveOrZero;
