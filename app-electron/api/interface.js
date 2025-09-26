const {
  postDataJWT,
  getDataJWT,
  patchDataJWT,
} = require("./jwt-request"); // gunakan jwt-request yg sudah kamu bikin
const {
  postDataShopee,
  getDataShopee,
} = require("./request-manager.js"); // untuk API Shopee tanpa JWT
const { parseCookieHeader } = require("../helpers/utils.js");

// ---------- USER & AUTH ----------
async function authenticateBot(data, options) {
  const response = await postDataJWT("/users/authenticate-bot-shopee", data, options);

  if (response?.status === 405 || response?.status === 403) {
    return response;
  }

  let cookies = {};
  if (response.headers?.["set-cookie"]) {
    for (let cookieStr of response.headers["set-cookie"]) {
      cookies = { ...cookies, ...parseCookieHeader(cookieStr) };
    }
  }

  return { ...response.data, sessionId: cookies["connect.sid"] };
}

const patchUseToken = (options) =>
  patchDataJWT("/users/token", { token: 1 }, options);

const getToken = (id) => getDataJWT(`/users/token/${id}`);

// ---------- CONFIG ----------
const getUserConfigByUserId = (options) => getDataJWT("/user-config", options);

const getUserConfigBySubscriptionId = ({ params, ...options }) =>
  getDataJWT(`/shopee/reply-reviews/${params.subscriptionId}`, options);

const getDatabaseCreators = (options) =>
  getDataJWT(`/shopee/shopee-creators/app`, options);

const getSavedCreators = ({ params, options }) =>
  getDataJWT(`/shopee/shopee-creators/${params.subscriptionId}`, options);

const getUserMessageBlastConfigBySubscriptionId = ({ params, ...options }) =>
  getDataJWT(`/shopee/message-blast/${params.subscriptionId}`, options);

const getUserSubscriptionByCode = ({ params, ...options }) =>
  getDataJWT(`/shopee-subscriptions/code/${params.code}`, options);

const updateSubscriptionStatus = ({ params, ...options }, data) =>
  patchDataJWT(`/shopee-subscriptions/${params.id}/status`, data, options);

// ---------- SHOPEE API ----------
const getTikblastSubscriptions = (options) => 
  getDataJWT("/shopee-subscriptions", options);

const postGetCreatorList = (endpoint, data, options) =>
  postDataShopee(endpoint, data, options);

const postGetUserReviews = (endpoint, options) =>
  getDataShopee(endpoint, options);

const postGetFollowers = (endpoint, options) =>
  getDataShopee(endpoint, options);

const postAddCreator = (subscriptionId, data, options) =>
  postDataJWT(`/shopee/shopee-creators/${subscriptionId}`, data, options);

const postFollowUser = (endpoint, data, options) =>
  postDataShopee(endpoint, data, options);

const getShopeeFollowingList = ({ limit, shopId, headers }) =>
  getDataShopee(
    `https://shopee.co.id/api/v4/pages/get_followee_list?limit=${limit}&offset=0&shopid=${shopId}`,
    { headers }
  );

const postShopeeUnfollow = ({ userId, headers }) =>
  postDataShopee("https://shopee.co.id/api/v4/pages/unfollow", { userid: userId }, { headers });

const postShopeeMessage = ({ payload, headers }) =>
  postDataShopee(
    "https://seller.shopee.co.id/webchat/api/v1.2/mini/messages",
    {
      request_id: `request_id_${Date.now()}`,
      entry_point: "direct_chat_entry_point",
      source: "minichat",
      type: "text",
      chat_send_option: {
        force_send_cancel_order_warning: false,
        comply_cancel_order_warning: false,
      },
      ...payload,
    },
    { headers }
  );

const getListOfReviews = (endpoint, headers) =>
  getDataShopee(endpoint, { headers });

const postReplyShop = async (endpoint, payload, { headers }) => {
  const updateHeaders = {
    ...headers,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    origin: "https://seller.shopee.co.id",
    priority: "u=1, i",
    "accept-language": "en-US,en;q=0.9",
    accept: "application/json, text/plain, */*",
    "content-type": "application/json;charset=UTF-8",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: updateHeaders,
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ---------- EXPORT ----------
module.exports = {
  // User & Auth
  authenticateBot,
  patchUseToken,
  getToken,

  // Config
  getTikblastSubscriptions,
  getDatabaseCreators,
  getSavedCreators,
  getUserConfigByUserId,
  getUserConfigBySubscriptionId,
  getUserMessageBlastConfigBySubscriptionId,
  getUserSubscriptionByCode,
  updateSubscriptionStatus,

  // Shopee API
  postGetCreatorList,
  postGetUserReviews,
  postGetFollowers,
  postAddCreator,
  postFollowUser,
  getShopeeFollowingList,
  postShopeeUnfollow,
  postShopeeMessage,
  getListOfReviews,
  postReplyShop,
};
