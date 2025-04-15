const puppeteer = require("puppeteer-extra");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { loginShopee } = require("../login");
const { postGetFollowers } = require("../../api/interface");
const { postFollowUser } = require("../../api/interface");
const { showSnackbar } = require("../../helpers/snackbar");
const { getListFollower } = require("./get-list-follower");

async function runAutoFollow({ chromePath, iteration }) {
  try {
    const url = store.get("link-auto-follow");
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
      page,
      requestDataList,
      iteration,
    };

    await startAutoFollow(context, browser);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

async function startAutoFollow(context, browser) {
  try {
    const page = context.page;
    const iteration = context.iteration;

    let followingCount = 0;
    while (followingCount < iteration) {
      const { newHeaders, listAccount } = await getListFollower(
        context,
        followingCount
      );

      let indexFollowing = 0;
      while (followingCount < iteration && indexFollowing < 20) {
        const follow = await postFollowUser(
          "https://shopee.co.id/api/v4/pages/follow",
          { userid: listAccount[indexFollowing].userid },
          {
            headers: context.requestDataList,
          }
        );
        console.log("post follow res =", follow?.status);
        let username = listAccount[indexFollowing].username;
        await showSnackbar({ page, message: `Berhasil follow ${username}` });
        await page.waitForTimeout(1200);
        followingCount++;
        indexFollowing++;
      }
    }

    dialog.showMessageBox({
      message: `Program Telah Selesai`,
      buttons: ["OK"],
    });
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

module.exports = { runAutoFollow };
