import type { Property } from ".";
import { shortInput } from "./inputs";

const anyNumber: Property<number, string> = {
  name: "Number",
  description: "Any number.",
  schema: { type: "integer" },
  input: shortInput("number"),
  convert: userInput => {
    const number = parseInt(userInput, 10);
    if (isNaN(number)) return null;
    return number;
  },
  format: number => number.toString(),
};

export default anyNumber;
