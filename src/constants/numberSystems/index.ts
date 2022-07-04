import base36 from "./base36";
import base64 from "./base64";
import binary from "./binary";
import decimal from "./decimal";
import hexadecimal from "./hexadecimal";
import math from "./math";
import roman from "./roman";

export interface NumberSystem {
  name: string;
  convert(input: string): number | null;
  format(stored: number): string;
}

// ordered in the way they appear when the user configures them
export default {
  decimal,
  hexadecimal,
  binary,
  base36,
  base64,
  roman,
  math,
} as const;
