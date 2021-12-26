import { Property, PropertyValue } from "./properties";
import { CountingData } from "./countingData";

export interface Trigger {
  short: string;
  long?: string;
  properties?: Array<Property>;
  explanation(properties: Array<Array<PropertyValue>>): string;
  check(data: CountingData, properties: Array<PropertyValue>): Promise<boolean>;
  limit?: number;
}
