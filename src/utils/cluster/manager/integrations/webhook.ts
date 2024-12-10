import config from "../../../../config";

export default function (counts: number, week: number): void {
  if (config.integrations.webhook) {
    void fetch(config.integrations.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value1: counts, value2: week }),
    });
  }
}
