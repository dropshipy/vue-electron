const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { dialog } = require("electron");
const {
  getShopeeFollowingList,
  postShopeeUnfollow,
} = require("../api/interface");

const { showSnackbar } = require("../helpers/snackbar");

async function autoUnfollow({ page, iteration, browser }) {
  const urlGetProfile = "https://shopee.co.id/api/v4/account/get_profile";
  let profile = null;
  let headers = null;

  page.on("response", async (response) => {
    if (response.url().includes(urlGetProfile)) {
      const responseData = await response.json();
      const data = responseData.data;
      profile = data;
    }
  });

  page.on("request", async (request) => {
    if (request.url().includes(urlGetProfile)) {
      headers = request.headers();

      const pageCookies = await page.cookies();
      headers["cookie"] = pageCookies
        .map(({ name, value }) => `${name}=${value}`)
        .join(";");
    }
  });

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.goto("https://shopee.co.id/user/account/profile", {
      waitUntil: "networkidle2",
    }),
  ]);

  try {
    if (profile?.user_profile) {
      const shopeeMaxLimit = 20;
      const isLoopRequired =
        iteration === "Semua" || iteration > shopeeMaxLimit;

      const payload = {
        limit: isLoopRequired ? shopeeMaxLimit : iteration,
        shopId: profile.user_profile.shopid,
        headers,
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
    await dialog.showMessageBox({
      message: `Terjadi kesalahan: ${error?.message}`,
      buttons: ["OK"],
    });
    console.log("Error in requestListAndUnfollow: ", error?.message);
    return true;
  }
}

module.exports = { autoUnfollow };
