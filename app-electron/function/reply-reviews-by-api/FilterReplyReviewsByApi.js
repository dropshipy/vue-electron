const { dialog } = require("electron");
const { clickByText } = require("../../helpers/utils");

const inputProductName = "#searchRequest";

const searchButton =
  "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.bg-white.shadow-card.ratingListWrap-0-2-8 > form > div:nth-child(3) > div > div > button.eds-react-button.eds-react-button--primary.eds-react-button--normal.eds-react-button--outline";

async function FilterReplyReviewsByApi(page, config) {
  const { productName, ratingComment } = config;

  let headers = null;

  let isLoading = false;

  const urlGetHeaders =
    "https://seller.shopee.co.id/api/v3/settings/search_shop_rating_comments_new/?SPC_CDS=";

  try {
    page.on("request", async (request) => {
      if (request.url().includes(urlGetHeaders)) {
        headers = request.headers();
        url = request.url();
        const pageCookies = await page.cookies();
        headers["cookie"] = pageCookies
          .map(({ name, value }) => `${name}=${value}`)
          .join(";");
      }
    });

    await page.goto("https://seller.shopee.co.id/portal/settings/shop/rating", {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    if (productName) {
      await page.focus(inputProductName);
      await page.type(inputProductName, productName, { delay: 100 });
    }
    await clickByText(page, "Perlu Dibalas");
    await clickByText(page, "Terapkan");
    isLoading = true;
    return { headers, isLoading };
  } catch (error) {
    await page.evaluate(() => {
      window.alert("Program Telah Selesai");
    });
    console.log(error.message);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
}

module.exports = { FilterReplyReviewsByApi };
