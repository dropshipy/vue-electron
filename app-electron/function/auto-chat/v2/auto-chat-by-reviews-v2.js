const puppeteer = require("puppeteer");
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const { getListReviewer } = require("./get-list-reviewer");
const { getToken } = require("../../../api/interface");

const store = new ElectronStore();
const { loginShopee } = require("../../login");
const {
  postGetUserReviews,
  postShopeeMessage,
} = require("../../../api/interface");
const { waitForTimeout } = require("../../../helpers/utils");

const { showSnackbar } = require("../../../helpers/snackbar");
const sendMessageToReviewer = require("./send-message-to-reviewer");

async function runAutoChatByReviewsV2({ chromePath, data }) {
  try {
    const { startPoint, iteration, template, isSendProduct } = data;

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    let headers = null;
    let shop_id = null;

    page.on("request", (request) => {
      if (
        request
          .url()
          .includes(
            "https://seller.shopee.co.id/api/sellermisc/sc_conf/get_shop_settings/?"
          )
      ) {
        headers = request.headers();
      }
      request.continue();
    });

    page.on("response", async (response) => {
      if (response.url().includes("/selleraccount/shop_info/")) {
        const res = await response.json();
        if (res.data) {
          shop_id = res.data.shop_id;
        }
      }
    });
    const { width, height } = await page.evaluate(() => {
      return {
        width: window.screen.width,
        height: window.screen.height,
      };
    });

    await page.setViewport({ width, height });
    const authBotRes = await loginShopee(page, browser);

    let loopCount = 1;

    let listReviewer = [];
    while (iteration >= loopCount) {
      listReviewer = await getListReviewer({
        browser,
        startPoint,
        loopCount,
      });

      if (listReviewer == undefined || listReviewer?.length == 0) {
        await dialog.showMessageBox({
          message: `Tidak ada reviewer`,
          buttons: ["OK"],
        });
        await browser.close();
        break;
      }
      const getTokenCustomer = await getToken(authBotRes.subscriptionData.id);

      const remainingToken = getTokenCustomer.data.userToken.token;

      await page.goto("https://seller.shopee.co.id/webchat/conversations", {
        waitUntil: "networkidle2",
        timeout: 10000,
      });

      if (remainingToken && remainingToken >= 1) {
        const sendMessage = await sendMessageToReviewer({
          page,
          headers,
          template,
          listReviewer,
          shop_id,
          iteration,
          loopCount,
          authBotRes,
          remainingToken,
          isSendProduct,
        });
        loopCount = sendMessage.loopCount;
      } else break;
    }

    await page.evaluate(() => {
      window.alert("Program Telah Selesai");
    });
    return;
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}
module.exports = { runAutoChatByReviewsV2 };
