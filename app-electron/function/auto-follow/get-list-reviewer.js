const axios = require("axios");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const {
  extractIdsFromProductUrl,
} = require("../../helpers/extract-shopee-ids");

async function getListReviewer(requestDataList, offset) {
  try {
    const url = store.get("link-auto-follow-by-reviews");
    const getIds = extractIdsFromProductUrl(url);
    const endpoint = "https://shopee.co.id/api/v2/item/get_ratings?";
    const params = {
      exclude_filter: 1,
      filter: 0,
      filter_size: 0,
      flag: 1,
      fold_filter: 0,
      itemid: getIds.itemId,
      limit: 20,
      offset: offset,
      relevant_reviews: false,
      request_source: 2,
      shopid: getIds.shopId,
      tag_filter: "",
      type: 0,
      variation_filters: "",
    };
    const newHeaders = {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      cookie: getCookieHeader(getRandomCookies()),
      pragma: "no-cache",
      priority: "u=0, i",
      "sec-ch-ua":
        '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    };

    console.log("newHeaders", newHeaders);

    try {
      const getReviewerRes = await axios.get(endpoint, {
        headers: newHeaders,
        params: params,
      });
      const { data } = getReviewerRes.data;
      console.log({ data });
      const listAccount = data.ratings.map(({ userid, author_username }) => ({
        userid,
        author_username,
      }));

      return { newHeaders, listAccount };
    } catch (error) {
      console.log(error.message);
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

module.exports = { getListReviewer };
