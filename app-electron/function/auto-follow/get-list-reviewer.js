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
    const newHeaders = (requestDataList = {
      ...requestDataList,
      cookie: clearCookieValues(requestDataList.cookie),
    });
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
      console.log({ listAccount });
      return { newHeaders, listAccount };
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {}
}

function clearCookieValues(params) {
  // Mendapatkan daftar semua cookie
  let cookies = params.split(";");

  // Variabel untuk menyimpan hasil akhir
  let result = "";

  // Loop melalui setiap cookie dan menghapus nilai jika ada
  cookies.forEach(function (cookie) {
    let parts = cookie.split("=");
    let cookieName = parts[0].trim();
    // Jika cookie memiliki nilai, tambahkan nama cookie dengan nilai kosong
    if (parts.length > 1) {
      result += cookieName + "=; ";
    } else {
      // Jika cookie tidak memiliki nilai, tambahkan langsung cookie tersebut
      result += cookie + "; ";
    }
  });
  console.log("result.trim()", result.trim());
  // Hapus spasi ekstra di akhir dan kembalikan hasilnya
  return result.trim();
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
