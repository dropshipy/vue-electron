const puppeteer = require("puppeteer-extra");

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
    let hasRepeatedPaginationOne = false;
    let followingCount = 0;
    let listAccount;
    let ratingTotal = 0;

    // base from 1
    let paginationTotal = 1;
    let paginationNow = 1;

    // base from 0
    let paginationStart = Math.floor(+startPoint / 6);
    let currentIndex = (+startPoint % 6) - 1;

    // Intercept rating response
    page.on("response", async (response) => {
      const url = response.url();
      if (url.startsWith("https://shopee.co.id/api/v2/item/get_ratings")) {
        const responseData = await response.json();
        listAccount = responseData.data.ratings;
        ratingTotal = responseData.data.item_rating_summary.rating_total;
        paginationTotal = Math.ceil(ratingTotal / 6);

        console.log("< --------- >");
        listAccount.forEach((element) => {
          console.log(element.author_username);
        });
        console.log("< --------- >");
      }
    });

    while (followingCount < iteration) {
      if (isFirstRun) {
        await page.goto(url);
        console.log("Silakan selesaikan captcha secara manual...");

        await page.waitForSelector('div.container[role="main"]', {
          timeout: 0,
        });

        await autoScroll(page);

        while (paginationStart !== 0 && paginationNow < paginationTotal) {
          await page.click(".shopee-icon-button.shopee-icon-button--right");
          await waitForTimeout(2500);
          paginationStart--;
          paginationNow++;
        }

        console.log(
          `pagination now ${paginationNow} and total ${paginationTotal}`
        );
      } else {
        try {
          if (paginationNow === paginationTotal) {
            if (hasRepeatedPaginationOne) {
              throw new Error("Komentar sudah tidak tersedia, Program Selesai");
            }

            await page.reload();
            await page.waitForSelector('div.container[role="main"]', {
              timeout: 0,
            });
            await autoScroll(page);
            paginationNow = 1;
            hasRepeatedPaginationOne = true;
          } else {
            await page.click(".shopee-icon-button.shopee-icon-button--right");
            await waitForTimeout(2500);
            paginationNow++;
          }
        } catch (err) {
          // dialog.showMessageBox({
          //   message: err.message,
          //   buttons: ["OK"],
          // });
          throw err;
        }
      }

      if (isFirstRun === false) {
        currentIndex = 0;
      }
      isFirstRun = false;
      console.log({ currentIndex });

      while (
        followingCount < iteration &&
        followingCount < ratingTotal &&
        currentIndex < listAccount.length
      ) {
        const follow = await postFollowUser(
          "https://shopee.co.id/api/v4/pages/follow",
          { userid: listAccount[currentIndex].userid },
          { headers: requestDataList }
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
      message: `${error.message}`,
      buttons: ["OK"],
    });
    console.error("main process:", error);
  }
}

// const handlePagination = () => {
//   let isAfterClick = false;
//         while (paginationStart !== 0 && paginationNow < paginationTotal) {
//           await page.click(".shopee-icon-button.shopee-icon-button--right");
//           await waitForTimeout(2500);
//           paginationStart--;
//           paginationNow++;
//           isAfterClick = true;
//         }
//         console.log(
//           `pagination now ${paginationNow} and total ${paginationTotal}`
//         );
//         if (paginationNow === paginationTotal && !isAfterClick) {
//           // kalau awal jalanin udah limit, reload halaman agar ulang dari pagination pertama saja
//           await page.reload();
//           await page.waitForSelector('div.container[role="main"]', {
//             timeout: 0,
//           });
//           await autoScroll(page);
//         }
// }

module.exports = { runAutoFollowByReviews };
