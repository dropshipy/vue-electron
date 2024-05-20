import axios from "axios";
export const state = () => ({
  user: null,
  token: null,
  isLoading: false,
});

export const getters = {
  getUserInfo(state) {
    return state.user;
  },
  getToken(state) {
    return state.token;
  },
  getLoading(state) {
    return state.isLoading;
  },
};

export const mutations = {
  setUserInfo(state, user) {
    state.user = user;
  },
  setToken(state, token) {
    state.token = token;
  },
  setIsloading(state, loading) {
    state.isLoading = loading;
  },
};

export const actions = {
  async getMe({ commit }, url) {
    commit("setIsloading", true);
    try {
      const response = await axios.get(url);
      const { userToken } = response.data;

      commit("setToken", userToken);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    commit("setIsloading", false);
  },
};
