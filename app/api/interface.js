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
  return await getDataShopee(endpoint, options);
};
// async function addExposeFunction({ page, config, sessionId }) {
//   await page.exposeFunction("sendCreatorData", async (creator) => {
//     await postAddCreator(creator, {
//       headers: {
//         Cookie: "connect.sid=" + sessionId,
//       },
//     });
//   });
// }
const postGetFollowers = async (endpoint, options) => {
  return await getDataShopee(endpoint, options);
};
const postAddCreator = async (data, options) => {
  return await postData("/shopee/shopee-creators", data, options);
};
const authenticateBot = async (data, options) => {
  const response = await postData(
    "/shopee-users/authenticate-bot",
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

const getShopeeFollowingList = async ({ limit, offset, shopId, headers }) => {
  const endpoint = `https://shopee.co.id/api/v4/pages/get_followee_list?limit=${limit}&offset=${offset}&shopid=${shopId}`;
  return await getDataShopee(endpoint, { headers });
};

module.exports = {
  postGetCreatorList,
  postAddCreator,
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
};
