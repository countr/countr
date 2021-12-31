import { Property, PropertyValue } from "./properties";
import { CountingData } from "./countingData";

export interface Trigger {
  short: string;
  long?: string;
  properties?: Array<Property>;
  explanation(properties: Array<Array<PropertyValue>>): string;
  check(data: CountingData, properties: Array<Array<PropertyValue>>): Promise<boolean>;
  supports: Array<"flows" | "notifications">;
  limitPerFlow?: number;
}
