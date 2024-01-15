export const state = () => ({
  user: null,
});

export const getters = {
  getUserInfo(state) {
    return state.user;
  },
};

export const mutations = {
  setUserInfo(state, user) {
    state.user = user;
  },
};
