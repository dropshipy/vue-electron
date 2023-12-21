const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { dialog } = require("electron");
const {
  getShopeeFollowingList,
  postShopeeUnfollow,
} = require("../api/interface");

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
      const shopeeMaxLimit = 50;
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

          const remaining = iteration - unfollowCount;
          payload.limit =
            remaining > shopeeMaxLimit ? shopeeMaxLimit : remaining;
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
    const responseGetList = await getShopeeFollowingList(payload);
    const resData = responseGetList.data.data;
    const accounts = resData.accounts || [];

    const { headers, page, browser } = payload;

    if (!accounts.length) {
      await dialog.showMessageBox({
        message: "Tidak ada akun yang di follow",
        buttons: ["OK"],
      });
      await browser.close();
      return true;
    }

    for (const account of accounts) {
      const responseUnfollow = await postShopeeUnfollow({
        userId: account.userid,
        headers,
      });

      if (responseUnfollow.status === 200) {
        const username = account.nickname || account.shopname;

        await page.evaluate((_username) => {
          const showToast = ({ wrapperSelector, textContent }) => {
            const wrapper = document.querySelector(wrapperSelector);
            const toastBar = document.createElement("div");

            // Assign styles using an object
            Object.assign(toastBar.style, {
              position: "fixed",
              top: "80px",
              left: "80px",
              backgroundColor: "#3a373c",
              border: "1px solid #3a373c",
              color: "#52c81e",
              fontWeight: "600",
              minWidth: "500px",
              maxWidth: "90%",
              fontSize: "36px",
              padding: "20px 30px",
              borderRadius: "10px",
              zIndex: "9999",
              opacity: "0",
              transition: "opacity 1s",
            });

            toastBar.textContent = textContent;
            wrapper.appendChild(toastBar);

            setTimeout(() => {
              toastBar.style.opacity = "1";
            }, 10);

            setTimeout(() => {
              toastBar.style.opacity = "0";
              toastBar.remove();
            }, 1000);
          };

          showToast({
            wrapperSelector: "body",
            textContent: `Berhasil unfollow ${_username}`,
          });
        }, username);
      }
      await page.waitForTimeout(1000);
    }

    return resData.nomore;
  } catch (error) {
    await dialog.showMessageBox({
      message: `Terjadi kesalahan: ${error?.message}`,
      buttons: ["OK"],
    });
    console.log("Error: ", error?.message);
  }
}

module.exports = { autoUnfollow };
