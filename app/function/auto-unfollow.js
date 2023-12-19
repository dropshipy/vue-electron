const { dialog } = require("electron");
const {
  getShopeeFollowingList,
  postShopeeUnfollow,
} = require("../api/interface");
const { showToast } = require("../helpers/toast");

async function requestListAndUnfollow(payload) {
  const responseGetList = await getShopeeFollowingList(payload);
  console.log({ responseGetList });

  const accounts = responseGetList.data.accounts || [];

  const { headers, page } = payload;

  for (const account of accounts) {
    const responseUnfollow = await postShopeeUnfollow({
      userId: account.userId,
      headers,
    });

    console.log({ responseUnfollow });

    const username = account.username;
    await page.evaluate((_username) => {
      showToast({
        wrapperSelector: ".shopee-top.container-wrapper",
        textContent: `Berhasil unfollow ${_username}`,
      });
    }, username);
    await page.waitForTimeout(1200);
  }

  return responseGetList.data.nomore;
}

async function autoUnfollow({ page, iteration }) {
  let shopeeProfile = null;
  let headers = null;

  page.on("response", async (response) => {
    if (
      response.url().includes("https://shopee.co.id/api/v4/account/get_profile")
    ) {
      const responseData = await response.json();
      const data = responseData.data;
      shopeeProfile = data;
      headers = response.headers();
    }
  });

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.goto("https://shopee.co.id/user/account/profile", {
      waitUntil: "networkidle2",
    }),
  ]);

  try {
    if (shopeeProfile) {
      const shopeeMaxLimit = 50;
      const isLoopRequired =
        iteration === "Semua" || iteration > shopeeMaxLimit;
      const limit = isLoopRequired ? shopeeMaxLimit : iteration;
      let offset = 0;
      let nomore = false;

      const shopId = shopeeProfile.shopId;

      if (isLoopRequired) {
        while (!nomore) {
          const isNomore = await requestListAndUnfollow({
            limit,
            offset,
            shopId,
            headers,
            page,
          });

          nomore = isNomore;
          offset += limit;
        }
      } else {
        await requestListAndUnfollow({
          limit,
          offset,
          shopId,
          headers,
          page,
        });
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
module.exports = { autoUnfollow };
