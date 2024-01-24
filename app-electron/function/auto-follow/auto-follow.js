const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { loginShopee } = require("../login");
const { postGetFollowers } = require("../../api/interface");
const { postFollowUser } = require("../../api/interface");
const { showSnackbar } = require("../../helpers/snackbar");

async function runAutoFollow({ chromePath, iteration }) {
  try {
    const url = store.get("link-auto-follow");
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
    });
    const page = await browser.newPage();
    const requestDataList = [];
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        request
          .url()
          .startsWith(
            "https://shopee.co.id/api/v4/shop/get_shop_seller_show?shopid="
          )
      ) {
        const information = {
          url: request.url(),
          requestHeaders: request.headers(),
        };
        requestDataList.push(information);
        request.continue();
      } else {
        request.continue();
      }
    });
    await loginShopee(page, browser);
    await page.goto(url);
    while (requestDataList.length <= 0) {
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
    // Create a URLSearchParams object
    const params = new URLSearchParams(
      new URL(context.requestDataList[0].url).search
    );
    // Get the value of the 'shopid' parameter
    const shopId = params.get("shopid");
    const iteration = context.iteration;
    console.log({ shopId });
    console.log({ iteration });
    const endpoint = `https://shopee.co.id/api/v4/pages/get_follower_list?limit=1&offset=0&shopid=${shopId}`;
    const header = context.requestDataList[0].requestHeaders;
    const getFollowersStatus = await postGetFollowers(endpoint, {
      headers: header,
    });
    const followerStatus = getFollowersStatus.data.data;
    //handle if followers are hidden by the shop
    if (followerStatus.hide_follow) {
      await page.evaluate(() => {
        alert("Toko ini menyembunyikan pengikutnya, kamu bisa coba toko lain");
      });
      await browser.close();
    } else {
      let followingCount = 0;
      while (followingCount < iteration) {
        let endPointGetFollowers = `https://shopee.co.id/api/v4/pages/get_follower_list?limit=20&offset=${followingCount}&shopid=${shopId}`;
        const getFollowers = await postGetFollowers(endPointGetFollowers, {
          headers: header,
        });
        let indexFollowing = 0;
        let dataFollowers = getFollowers.data.data.accounts;
        while (followingCount < iteration && indexFollowing < 20) {
          const follow = await postFollowUser(
            "https://shopee.co.id/api/v4/pages/follow",
            { userid: dataFollowers[indexFollowing].shopid },
            {
              headers: header,
            }
          );
          let username = dataFollowers[indexFollowing].username;
          await showSnackbar({ page, message: `Berhasil follow ${username}` });
          await page.waitForTimeout(1200);
          followingCount++;
          indexFollowing++;
        }
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
