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

  page.on("request", (request) => {
    if (request.url().includes(urlGetProfile)) {
      headers = request.headers();
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
        offset: 0,
        shopId: profile.user_profile.shopid,
        headers,
        page,
        browser,
      };

      let nomore = false;

      if (isLoopRequired) {
        while (!nomore) {
          const isNomore = await requestListAndUnfollow(payload);

          nomore = isNomore;
          payload.offset += payload.limit;
        }
      } else {
        await requestListAndUnfollow(payload);
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

      if (responseUnfollow.data.data) {
        const username = account.username;
        await page.evaluate((_username) => {
          const showToast = ({ wrapperSelector, textContent }) => {
            const wrapper = document.querySelector(wrapperSelector);
            const toastBar = document.createElement("div");

            // Assign styles using an object
            Object.assign(toastBar.style, {
              position: "absolute",
              top: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#3a373c",
              border: "1px solid #3a373c",
              color: "#52c81e",
              fontWeight: "600",
              minWidth: "500px",
              maxWidth: "90%",
              fontSize: "40px",
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
            wrapperSelector: ".shopee-top.container-wrapper",
            textContent: `Berhasil unfollow ${_username}`,
          });
        }, username);
      }
      await page.waitForTimeout(1200);
    }

    return resData.nomore || true;
  } catch (error) {
    console.log("Error", error?.message);
  }
}

module.exports = { autoUnfollow };
