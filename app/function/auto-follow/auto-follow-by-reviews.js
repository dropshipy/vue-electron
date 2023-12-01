const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const { Browser } = require("puppeteer");
const store = new ElectronStore();
const { executablePath } = require("puppeteer");
const { loginShopee } = require("../login");
const { postGetUserReviews } = require("../../api/interface");
const { postFollowUser } = require("../../api/interface");
async function runAutoFollowByReviews({ chromePath, data }) {
  const startPoint = data.startPointFollowByReviews;
  const iteration = data.iterationFollowByReviews;

  try {
    puppeteer.use(StealthPlugin());
    const url = store.get("link-auto-follow-by-reviews");
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
            "https://shopee.co.id/api/v2/item/get_ratings?exclude_filter=1&filter=0&filter_size=0&flag=1&fold_filter=0"
          )
      ) {
        const information = {
          url: request.url(),
          requestHeaders: request.headers(),
        };
        console.log({ request });
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
  let endpoint = requestDataList[0]?.url;
  const header = requestDataList[0]?.requestHeaders;
  endpoint = endpoint.replace(/limit=\d+/, `limit=${20}`);
  try {
    let followingCount = 1;
    let currentIndex = 0;
    while (followingCount <= iteration) {
      console.log({ iteration });
      console.log({ followingCount });
      if (followingCount == 1) {
        endpoint = endpoint.replace(/offset=\d+/, `offset=${startPoint - 1}`);
      } else {
        endpoint = endpoint.replace(
          /offset=\d+/,
          `offset=${followingCount - 1}`
        );
      }
      const getUser = await postGetUserReviews(endpoint, {
        headers: header,
      });
      currentIndex = 0;
      console.log({ currentIndex });
      while (followingCount <= iteration && currentIndex < 20) {
        const follow = await postFollowUser(
          "https://shopee.co.id/api/v4/pages/follow",
          { userid: getUser.data.data.ratings[currentIndex].userid },
          {
            headers: header,
          }
        );
        const username =
          getUser.data.data.ratings[currentIndex].author_username;
        await page.evaluate((authorUsernmae) => {
          // Create a div element for the toast bar
          const header = document.querySelector(
            ".shopee-top.container-wrapper"
          );
          const toastBar = document.createElement("div");
          // Set some basic styles
          toastBar.style.position = "absolute";
          toastBar.style.top = "100px";
          toastBar.style.left = "50%";
          toastBar.style.transform = "translateX(-50%)";
          toastBar.style.backgroundColor = "#3a373c";
          toastBar.style.border = "1px solid #3a373c";
          toastBar.style.color = "#52c81e ";
          toastBar.style.fontWeight = "600";
          toastBar.style.minWidth = "500px";
          toastBar.style.maxWidth = "90%";
          toastBar.style.fontSize = "40px";
          toastBar.style.padding = "20px 30px";
          toastBar.style.borderRadius = "10px";
          toastBar.style.zIndex = "9999";
          // Set the text content of the toast bar
          toastBar.textContent = `Berhasil follow user ${authorUsernmae}`;
          // Append the toast bar to the body
          header.appendChild(toastBar);
          toastBar.style.opacity = "0";
          setTimeout(() => {
            toastBar.style.transition = "opacity 1s";
            toastBar.style.opacity = "1";
          }, 10);
          setTimeout(() => {
            toastBar.style.opacity = "0";
            toastBar.remove();
          }, 800);
        }, username);

        await page.waitForTimeout(800);
        console.log(followingCount, "~ status = ", follow.status);
        currentIndex++;
        followingCount++;
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
