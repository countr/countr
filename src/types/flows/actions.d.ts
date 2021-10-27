import { CountingData } from "./countingData";
import { Property, PropertyValue } from "./properties";

interface Action {
  short: string;
  long?: string;
  properties?: Array<Property>;
  explanation(properties: Array<PropertyValue>): string;
  run(data: CountingData, properties: Array<PropertyValue>): Promise<boolean>,
  limit?: number;
}