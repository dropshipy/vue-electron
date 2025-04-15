const puppeteer = require("puppeteer-extra");
const axios = require("axios");

const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { loginShopee } = require("../login");
const { postGetUserReviews } = require("../../api/interface");
const { postFollowUser } = require("../../api/interface");
const { showSnackbar } = require("../../helpers/snackbar");
const { getListReviewer } = require("./get-list-reviewer");
const { autoScroll, waitForTimeout } = require("../../helpers/utils");

async function runAutoFollowByReviews({ chromePath, data }) {
  const startPoint = data.startPointFollowByReviews;
  const iteration = data.iterationFollowByReviews;

  try {
    const url = store.get("link-auto-follow-by-reviews");
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
      browser,
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
  browser,
  requestDataList,
  iteration,
  startPoint,
  page,
}) {
  try {
    const url = store.get("link-auto-follow-by-reviews");
    let isFirstRun = true;
    let followingCount = 0;
    let listAccount;
    let ratingTotal = 0;
    let paginationTotal = 1;
    let paginationNow = 1;

    let capturedRequestHeaders = null;
    let capturedCookies = null;
    let capturedQueryParams = null;

    // Intercept response
    page.on("response", async (response) => {
      const url = response.url();
      if (url.startsWith("https://shopee.co.id/api/v2/item/get_ratings")) {
        // const req = response.request();
        // capturedRequestHeaders = req.headers();
        // const urlObj = new URL(url);
        // capturedQueryParams = Object.fromEntries(urlObj.searchParams);
        // capturedCookies = await page.cookies();

        // Response Data
        const responseData = await response.json();
        listAccount = responseData.data.ratings;
        ratingTotal = responseData.data.item_rating_summary.rating_total;
        paginationTotal = ratingTotal / 6;
      }
    });

    while (followingCount < iteration) {
      // let offset = +startPoint - 1;

      // if (followingCount > 0) {
      //   offset = +startPoint + followingCount - 1;
      // }

      if (isFirstRun) {
        await page.goto(url);
        console.log("Silakan selesaikan captcha secara manual...");
        await page.waitForSelector('div.container[role="main"]', {
          timeout: 0,
        });
        await autoScroll(page);

        while (+startPoint > 6 && paginationNow < paginationTotal) {
          await page.click(".shopee-icon-button.shopee-icon-button--right");
          await waitForTimeout(2500);
          paginationNow++;
        }
        isFirstRun = false;
      } else {
        try {
          await page.click(".shopee-icon-button.shopee-icon-button--right");
          await waitForTimeout(2500);
        } catch {
          dialog.showMessageBox({
            message: "Komentar sudah tidak tersedia",
            buttons: ["OK"],
          });
          break;
        }
      }

      // const { newHeaders, listAccount } = await getListReviewer(
      //   requestDataList,
      //   offset
      // );

      let currentIndex = 0;

      while (
        followingCount < iteration &&
        currentIndex < 6 &&
        followingCount < ratingTotal
      ) {
        const follow = await postFollowUser(
          "https://shopee.co.id/api/v4/pages/follow",
          { userid: listAccount[currentIndex].userid },
          {
            headers: requestDataList,
          }
        );
        const username = listAccount[currentIndex].author_username;
        await showSnackbar({
          page,
          message: `Berhasil follow ${username}`,
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
    browser.close();
  } catch (error) {
    dialog.showMessageBox({
      message: `87920 = ${error.message}`,
      buttons: ["OK"],
    });
    console.error("87920 Error in the main process:", error);
  }
}

module.exports = { runAutoFollowByReviews };
