const puppeteer = require("puppeteer");
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { loginShopee } = require("../login");
const {
  postGetUserReviews,
  postShopeeMessage,
} = require("../../api/interface");
const {
  waitForTimeout,
  waitForLocalStorageData,
  getLocalStorageData,
} = require("../../helpers/utils");
const {
  extractIdsFromProductUrl,
} = require("../../helpers/extract-shopee-ids");

const { showSnackbar } = require("../../helpers/snackbar");

const DEFAULT_LIMIT = 20;

async function runAutoChatByReviews({ chromePath, data }) {
  try {
    const url = store.get("link-auto-chat-by-reviews");
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
    });
    const pages = await browser.pages();
    const page = pages[0];
    const { width, height } = await page.evaluate(() => {
      return {
        width: window.screen.width,
        height: window.screen.height,
      };
    });

    await page.setViewport({ width, height });
    await loginShopee(page, browser);

    const requestData = {
      url: null,
      headers: null,
    };

    const source = {
      shopId: null,
      itemId: null,
    };

    const productIds = extractIdsFromProductUrl(url);

    if (productIds) {
      source.shopId = productIds.shopId;
      source.itemId = productIds.itemId;
    } else {
      throw new Error("Produk tidak ditemukan");
    }
    await page.reload();
    page.on("request", async (request) => {
      if (request.url().includes("/selleraccount/shop_info/")) {
        requestData.headers = request.headers();
      }
    });

    page.on("response", async (response) => {
      if (response.url().includes("/selleraccount/shop_info/")) {
        const res = await response.json();
        if (res.data) {
          data["shopId"] = res.data.shop_id;
        }

        let getReviewsURL = new URL(
          "https://shopee.co.id/api/v2/item/get_ratings"
        );
        getReviewsURL.searchParams.set("exclude_filter", "1");
        getReviewsURL.searchParams.set("flag", "1");
        getReviewsURL.searchParams.set("relevant_reviews", "false");
        getReviewsURL.searchParams.set("request_source", "2");
        getReviewsURL.searchParams.set("type", "0");
        getReviewsURL.searchParams.set("limit", DEFAULT_LIMIT);
        getReviewsURL.searchParams.set("itemid", source.itemId);
        getReviewsURL.searchParams.set("shopid", source.shopId);

        requestData.url = getReviewsURL;

        await waitForLocalStorageData(page, "mini-session");

        const miniSessionData = await getLocalStorageData(page, "mini-session");
        if (miniSessionData) {
          const token = JSON.parse(miniSessionData)?.token;
          if (token) {
            requestData.headers["authorization"] = `Bearer ${token}`;
          }
        } else {
          throw new Error("Token tidak ditemukan");
        }

        await chatByReviews({
          requestData,
          page,
          browser,
          ...data,
        });
      }
    });
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

async function chatByReviews({
  requestData,
  page,
  browser,
  startPoint,
  iteration,
  template,
  shopId,
}) {
  try {
    const { url, headers } = requestData;
    let chatCount = 0;

    while (chatCount < iteration) {
      let offset = +startPoint - 1;
      if (chatCount > 0) {
        offset = +startPoint + chatCount - 1;
      }

      url.searchParams.set("offset", offset);

      const endpoint = url.toString();

      const resReviews = await postGetUserReviews(endpoint, {
        headers,
      });

      let currentIndex = 0;
      console.log("Starting chat: ", { currentIndex, chatCount, iteration });

      while (chatCount < iteration && currentIndex < DEFAULT_LIMIT) {
        const reviewer = resReviews?.data?.data?.ratings[currentIndex];

        const resChat = await postShopeeMessage({
          payload: {
            to_id: reviewer?.userid,
            shop_id: shopId,
            content: {
              text: template,
            },
          },
          headers,
        });

        const username = reviewer?.author_username;

        if (resChat?.status === 200) {
          await showSnackbar({ page, message: `Berhasil chat ke ${username}` });
        }

        await waitForTimeout(1000);
        currentIndex++;
        chatCount++;

        console.log({
          chatCount,
          status: resChat.status,
          username,
        });
      }
    }
    await dialog.showMessageBox({
      message: `Program Telah Selesai`,
      buttons: ["OK"],
    });
    await browser.close();
  } catch (error) {
    await dialog.showMessageBox({
      message: `Terjadi kesalahan: ${error?.message}`,
      buttons: ["OK"],
    });
    console.log("Error: ", error?.message);
  }
}

module.exports = { runAutoChatByReviews };
