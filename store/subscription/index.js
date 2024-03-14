export const state = () => ({
  subscription: null,
});

export const getters = {
  getSubscriptionInfo(state) {
    return state.subscription;
  },
};

export const mutations = {
  setSubscriptionInfo(state, subscription) {
    state.subscription = subscription;
  },
};
