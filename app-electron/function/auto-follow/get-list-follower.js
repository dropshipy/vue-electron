const axios = require("axios");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const {
  extractIdsFromProductUrl,
} = require("../../helpers/extract-shopee-ids");

async function getListFollower({ requestDataList }, followingCount) {
  try {
    const url = store.get("link-auto-follow");
    const getIds = extractIdsFromProductUrl(url);
    const shopId = getIds.shopId;
    const endpoint = "https://shopee.co.id/api/v4/pages/get_follower_list?";
    const params = {
      limit: 20,
      offset: followingCount,
      shopid: shopId,
    };
    const newHeaders = (requestDataList = {
      ...requestDataList,
      cookie: getCookieHeader(getRandomCookies),
    });

    try {
      const getReviewerRes = await axios.get(endpoint, {
        headers: newHeaders,
        params: params,
      });
      const { data } = getReviewerRes.data;
      console.log("data", data);
      const listAccount = data.accounts.map(({ userid, username }) => ({
        userid,
        username,
      }));

      return { newHeaders, listAccount };
    } catch (error) {
      console.log(error);
    }
  } catch (error) {}
}

function getRandomCookies() {
  return {
    SPC_SI: "",
    SPC_SEC_SI: "",
    SPC_F: "",
    REC_T_ID: "",
    SPC_R_T_ID: "",
    SPC_R_T_IV: "",
    SPC_T_ID: "",
    SPC_T_IV: "",
  };
}
function getCookieHeader(cookies) {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

module.exports = { getListFollower };
