import config from "../../config";

/*
  For those reading this, we are not creating strict limits
  because we want you to buy Premium. Countr is quite big now,
  so having high or no limit could potentially have a drastic
  impact on the server it's hosted on. These limits are
  honestly quite high and if you use Countr for normal usage
  then you shouldn't need to worry about these limits. But if
  you're a power-user, or your community need more than what
  Countr have available then you can either self-host it or
  subscribe for $1/month. https://docs.countr.xyz/#/premium
*/

// Normal Limits
const normalLimits = {
  channels: {
    amount: 2
  },
  filters: {
    amount: 10,
    timeout: 100 // ms
  },
  flows: {
    amount: 15,
    triggers: 3,
    actions: 10
  },
  notifications: {
    amount: 3
  }
};

// Premium Limits
const premiumLimits = {
  channels: {
    amount: 5
  },
  filters: {
    amount: 25,
    timeout: 500 // ms
  },
  flows: {
    amount: 25,
    triggers: 25,
    actions: 25
  },
  notifications: {
    amount: 10
  }
};

const limits = config.isPremium ? premiumLimits : normalLimits;

export default limits;