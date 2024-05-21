const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { dialog } = require("electron");

const {
  extractIdsFromProductUrl,
} = require("../../../helpers/extract-shopee-ids");
const { waitForTimeout } = require("../../../helpers/utils");

// max limit 50
const reviewUrl = new URL(
  "https://shopee.co.id/api/v2/item/get_ratings?exclude_filter=1&filter=0&filter_size=0&flag=1&fold_filter=0&itemid=&limit=50&offset=0&relevant_reviews=false&request_source=2&shopid=&tag_filter=&type=0&variation_filters="
);

async function getListReviewer({ browser, startPoint, loopCount }) {
  try {
    const page = await browser.newPage();

    const url = store.get("link-auto-chat-by-reviews");

    const productIds = extractIdsFromProductUrl(url);

    const currentOffset = startPoint - 1 + loopCount - 1;

    if (productIds) {
      reviewUrl.searchParams.set("itemid", productIds.itemId);
      reviewUrl.searchParams.set("shopid", productIds.shopId);
      reviewUrl.searchParams.set("offset", currentOffset);
    } else {
      dialog.showMessageBox({
        message: "Produk tidak ditemukan",
        buttons: ["OK"],
      });
      console.error("Error in the main process:", error);
      throw new Error("Produk tidak ditemukan");
    }
    const { width, height } = await page.evaluate(() => {
      return {
        width: window.screen.width,
        height: window.screen.height,
      };
    });

    await page.goto(reviewUrl);
    await page.setViewport({ width, height });

    let listReviewer = [];

    page.on("response", async (response) => {
      if (
        response.url().includes("https://shopee.co.id/api/v2/item/get_ratings")
      ) {
        const data = await response.json();
        if (data) {
          if (data?.error == 0) {
            listReviewer = [];
          }

          listReviewer = data.data.ratings;
        }
      }
    });
    let iteration = 0;
    while (iteration < 3) {
      if (listReviewer.length > 0) {
        const newListReviewer = listReviewer.map(
          ({ userid, author_username }) => ({
            userid,
            author_username,
          })
        );

        // await page.close();
        return newListReviewer;
      } else await page.reload();
      iteration++;
      await waitForTimeout(500);
    }
    if (listReviewer.length < 1) {
      // await page.close();
      return [];
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getListReviewer };
