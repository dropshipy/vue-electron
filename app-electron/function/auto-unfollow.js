const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const { getFollowingList } = require("./auto-follow/get-list-follower");

const { dialog } = require("electron");
const {
  getShopeeFollowingList,
  postShopeeUnfollow,
} = require("../api/interface");

const { showSnackbar } = require("../helpers/snackbar");

async function autoUnfollow({ page, iteration, browser }) {
  try {
    let requestDataList = null;
    let shopId = null;
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
    page.on("response", async (response) => {
      if (
        response
          .url()
          .startsWith(
            "https://seller.shopee.co.id/api/selleraccount/shop_info/"
          )
      ) {
        const responseData = await response.json();

        shopId = responseData.data.shop_id;
      }
    });

    await page.goto("https://seller.shopee.co.id/");
    while (requestDataList == null || shopId == null) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const shopeeMaxLimit = 20;
    const isLoopRequired = iteration === "Semua" || iteration > shopeeMaxLimit;

    const payload = {
      limit: isLoopRequired ? shopeeMaxLimit : iteration,
      shopId,
      headers: requestDataList,
      page,
      browser,
    };

    let nomore = false;
    let unfollowCount = 0;

    console.log(`--- START: Unfollow ${iteration} users ---`);

    if (isLoopRequired) {
      const shouldLooping = () => {
        let continueLooping = !nomore;

        if (iteration !== "Semua") {
          continueLooping = !nomore && unfollowCount < iteration;
        }

        return continueLooping;
      };

      while (shouldLooping()) {
        const isNomore = await requestListAndUnfollow(payload);
        nomore = isNomore;
        unfollowCount += +payload.limit;

        if (iteration !== "Semua") {
          const remaining = iteration - unfollowCount;
          payload.limit =
            remaining > shopeeMaxLimit ? shopeeMaxLimit : remaining;
        }
      }
    } else {
      await requestListAndUnfollow(payload);
    }

    await dialog.showMessageBox({
      message: `Program Telah Selesai`,
      buttons: ["OK"],
    });
    await browser.close();
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

async function requestListAndUnfollow(payload) {
  try {
    const { headers, page, browser, limit } = payload;
    await page.goto("https://seller.shopee.co.id");

    const responseGetList = await getShopeeFollowingList(payload);

    console.log("Get following list:", {
      status: responseGetList.status,
      limit,
    });

    if (responseGetList.status !== 200) {
      console.log("Failed to get following list:", responseGetList);
      return true;
    }

    const resData = responseGetList.data?.data;
    const accounts = resData.accounts || [];

    if (!accounts.length) {
      await dialog.showMessageBox({
        message: "Tidak ada akun yang di follow",
        buttons: ["OK"],
      });
      await browser.close();
      return true;
    }

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      const responseUnfollow = await postShopeeUnfollow({
        userId: account.userid,
        headers,
      });

      const username = account.nickname || account.shopname;

      console.log("Response unfollow:", {
        status: responseUnfollow.status,
        order: i + 1,
        username,
      });

      if (responseUnfollow.status === 200) {
        await showSnackbar({ page, message: `Berhasil unfollow: ${username}` });
      } else {
        await dialog.showMessageBox({
          message: `Gagal unfollow ${username}`,
          buttons: ["OK"],
        });
      }
      await page.waitForTimeout(1000);
    }

    return resData.nomore;
  } catch (error) {
    console.log("Error in requestListAndUnfollow: ", error?.message);
    await dialog.showMessageBox({
      message: `Terjadi kesalahan: ${error?.message}`,
      buttons: ["OK"],
    });
    return true;
  }
}

module.exports = { autoUnfollow };
