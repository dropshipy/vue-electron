export const state = () => ({
  isFollowByReviews: false,
  isFollowByShop: false,
  isUnfollow: false,
  isChat: false,
  isReplyReviews: false,
});

export const getters = {
  getFollowByReviews(state) {
    return state.isFollowByReviews;
  },
  getFollowByShop(state) {
    return state.isFollowByShop;
  },
  getUnfollow(state) {
    return state.isUnfollow;
  },
  getChat(state) {
    return state.isChat;
  },
  getReplyReviews(state) {
    return state.isReplyReviews;
  },
};

export const mutations = {
  setFollowByReviews(state, loading) {
    state.isFollowByReviews = loading;
  },
  setFollowByShop(state, loading) {
    state.isFollowByShop = loading;
  },
  setUnfollow(state, loading) {
    state.isUnfollow = loading;
  },
  setChat(state, loading) {
    state.isChat = loading;
  },
  setReplyReviews(state, loading) {
    state.isReplyReviews = loading;
  },
};

export const actions = {
};
