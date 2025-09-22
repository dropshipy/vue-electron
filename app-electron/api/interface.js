// const ENDPOINT = require("./endpoint.js").ENDPOINT;
const postData = require("./request-manager.js").postData;
const postDataShopee = require("./request-manager.js").postDataShopee;
const getData = require("./request-manager.js").getData;
const getDataShopee = require("./request-manager.js").getDataShopee;
const patchData = require("./request-manager.js").patchData;
const { parseCookieHeader } = require("../helpers/utils.js");

const postGetCreatorList = async (endpoint, data, options) => {
  return await postDataShopee(endpoint, data, options);
};
const postGetUserReviews = async (endpoint, options) => {
  try {
    return await getDataShopee(endpoint, options);
  } catch (error) {
    console.log("eror ", error);
  }
};

const patchUseToken = async (options) => {
  try {
    return await patchData(
      "/users/token",
      {
        token: 1,
      },
      options
    );
  } catch (error) {
    console.log("eror patch", error);
  }
};

const getToken = async (id) => {
  return await getData(`/users/token/${id}`);
};

const postGetFollowers = async (endpoint, options) => {
  return await getDataShopee(endpoint, options);
};

const postAddCreator = async (subscriptionId, data, options) => {
  return await postData(
    `/shopee/shopee-creators/${subscriptionId}`,
    data,
    options
  );
};
const checkSubscriptionCreator = async (subscriptionId, options) => {
  return await getData(
    `/shopee/shopee-creators/check/${subscriptionId}`,
    options
  );
};

const authenticateBot = async (data, options) => {
  const response = await postData(
    "/users/authenticate-bot-shopee",
    data,
    options
  );
  if (response?.status == 405 || response?.status == 403) {
    return response;
  }

  let cookies = {};

  if (response.headers["set-cookie"]) {
    for (let cookieStr of response.headers["set-cookie"]) {
      const cookie = parseCookieHeader(cookieStr);
      cookies = {
        ...cookies,
        ...cookie,
      };
    }
  }
  return { ...response.data, sessionId: cookies["connect.sid"] };
};
const updateSubscriptionStatus = async (data, options) => {
  const { params } = options;
  return await patchData(
    `/shopee-subscriptions/${params.id}/status`,
    data,
    options
  );
};
const getUserConfigByUserId = async (options) => {
  return await getData("/user-config", options);
};

const getUserConfigBySubscriptionId = async (options) => {
  const { params } = options;
  return await getData(
    `/shopee/reply-reviews/${params.subscriptionId}`,
    options
  );
};
const getUserMessageBlastConfigBySubscriptionId = async (options) => {
  const { params } = options;
  return await getData(
    `/shopee/message-blast/${params.subscriptionId}`,
    options
  );
};

const getUserSubscriptionByCode = async (options) => {
  const { params } = options;
  return await getData(`/shopee-subscriptions/code/${params.code}`, options);
};
const postFollowUser = async (endpoint, data, options) => {
  return await postDataShopee(endpoint, data, options);
};

const getShopeeFollowingList = async ({ limit, shopId, headers }) => {
  const endpoint = `https://shopee.co.id/api/v4/pages/get_followee_list?limit=${limit}&offset=0&shopid=${shopId}`;
  return await getDataShopee(endpoint, { headers });
};

const postShopeeUnfollow = async ({ userId, headers }) => {
  const endpoint = "https://shopee.co.id/api/v4/pages/unfollow";
  return await postDataShopee(endpoint, { userid: userId }, { headers });
};

const postShopeeMessage = async ({ payload, headers }) => {
  const endpoint = "https://seller.shopee.co.id/webchat/api/v1.2/mini/messages";

  const data = {
    request_id: `request_id_${Date.now()}`,
    entry_point: "direct_chat_entry_point",
    source: "minichat",
    type: "text",
    chat_send_option: {
      force_send_cancel_order_warning: false,
      comply_cancel_order_warning: false,
    },
    ...payload,
  };

  return await postDataShopee(endpoint, data, { headers });
};

const getListOfReviews = async (endpoint, headers) => {
  return await getDataShopee(endpoint, { headers });
};

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

  fetch(endpoint, {
    method: "POST",
    headers: updateHeaders,
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => console.log("Reply by api:", data.message))
    .catch((error) => console.error("Error:", error));
  // return await postDataShopee(endpoint, payload, updateHeaders);
};

module.exports = {
  postGetCreatorList,
  postAddCreator,
  checkSubscriptionCreator,
  authenticateBot,
  getUserConfigByUserId,
  getUserConfigBySubscriptionId,
  getUserSubscriptionByCode,
  getUserMessageBlastConfigBySubscriptionId,
  updateSubscriptionStatus,
  postGetUserReviews,
  postFollowUser,
  postGetFollowers,
  getShopeeFollowingList,
  postShopeeUnfollow,
  postShopeeMessage,
  getListOfReviews,
  postReplyShop,
  patchUseToken,
  getToken,
};
