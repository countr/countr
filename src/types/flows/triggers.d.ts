interface Trigger {
  short: string;
  long?: string;
  properties?: Array<Property>;
  explanation(properties: Array<PropertyValue>): string;
  check(data: CountingData, properties: Array<PropertyValue>): Promise<boolean>;
  limit?: number;
}