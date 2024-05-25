const puppeteer = require("puppeteer-extra");

const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { loginShopee } = require("../login");
const { postGetUserReviews } = require("../../api/interface");
const { postFollowUser } = require("../../api/interface");
const { showSnackbar } = require("../../helpers/snackbar");
const { getListReviewer } = require("./get-list-reviewer");

async function runAutoFollowByReviews({ chromePath, data }) {
  const startPoint = data.startPointFollowByReviews;
  const iteration = data.iterationFollowByReviews;

  try {
    const url = store.get("link-auto-follow-by-reviews");
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
    });
    const page = await browser.newPage();
    const { width, height } = await page.evaluate(() => {
      return {
        width: window.screen.width,
        height: window.screen.height,
      };
    });

    await page.setViewport({ width, height });
    let requestDataList = null;
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        request
          .url()
          .startsWith(
            "https://seller.shopee.co.id/api/selleraccount/shop_info/"
          )
      ) {
        requestDataList = request.headers();
        request.continue();
      } else {
        request.continue();
      }
    });

    await loginShopee(page, browser);

    await page.goto("https://seller.shopee.co.id/");
    while (requestDataList == null) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const context = {
      startPoint,
      iteration,
      requestDataList,
      page,
    };
    await followByReviews(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

async function followByReviews({
  requestDataList,
  iteration,
  startPoint,
  page,
}) {
  try {
    let followingCount = 0;

    while (followingCount < iteration) {
      console.log({ iteration, followingCount });

      let offset = +startPoint - 1;

      if (followingCount > 0) {
        offset = +startPoint + followingCount - 1;
      }

      const { newHeaders, listAccount } = await getListReviewer(
        requestDataList,
        offset
      );

      let currentIndex = 0;
      console.log({ currentIndex });

      while (followingCount < iteration && currentIndex < 20) {
        const follow = await postFollowUser(
          "https://shopee.co.id/api/v4/pages/follow",
          { userid: listAccount[currentIndex].userid },
          {
            headers: newHeaders,
          }
        );
        await showSnackbar({
          page,
          message: `Berhasil follow ${listAccount[currentIndex].author_username}`,
        });

        await page.waitForTimeout(1200);
        currentIndex++;
        followingCount++;

        console.log({
          followingCount,
          status: follow.status,
          username: username,
        });
      }
    }
    dialog.showMessageBox({
      message: `Program Telah Selesai`,
      buttons: ["OK"],
    });
  } catch (error) {
    dialog.showMessageBox({
      message: `87920 = ${error.message}`,
      buttons: ["OK"],
    });
    console.error("87920 Error in the main process:", error);
  }
}

module.exports = { runAutoFollowByReviews };
