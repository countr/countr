import config from "../config";

const premiumLimits = {
  channels: { amount: 5 },
  filters: { amount: 25, timeout: 500 },
  flows: { amount: 25, triggers: 25, actions: 25 },
  notifications: { amount: 10 },
};

const normalLimits = {
  channels: { amount: 2 },
  filters: { amount: 10, timeout: 100 },
  flows: { amount: 15, triggers: 3, actions: 10 },
  notifications: { amount: 3 },
};

export default { ...config.isPremium ? premiumLimits : normalLimits } as const;
