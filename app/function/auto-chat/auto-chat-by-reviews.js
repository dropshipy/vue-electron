const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { loginShopee } = require("../login");
const {
  postGetUserReviews,
  postShopeeMessage,
} = require("../../api/interface");
const { waitForTimeout } = require("../../helpers/utils");

async function runAutoChatByReviews({ chromePath, data }) {
  try {
    puppeteer.use(StealthPlugin());

    const url = store.get("link-auto-chat-by-reviews");
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
    });
    const page = await browser.newPage();

    await loginShopee(page, browser);

    page.on("response", async (response) => {
      if (response.url().includes("/get_account_info")) {
        const res = await response.json();
        if (res.data) {
          data["shopId"] = res.data.shopid;
        }

        await waitForTimeout(2000);

        await page.waitForSelector(".page-product__shop");
        await page.evaluate(() => {
          // Note: scroll down to trigger fetch /get_ratings
          const shopElement = document.querySelector(".page-product__shop");
          if (shopElement) {
            shopElement.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    });

    page.on("request", async (request) => {
      if (request.url().includes("/get_ratings")) {
        const headers = request.headers();

        const miniSession = await page.evaluate(() =>
          JSON.parse(localStorage.getItem("mini-session") || "{}")
        );

        if (miniSession && miniSession.token) {
          headers["authorization"] = `Bearer ${miniSession?.token}`;
        }

        const requestData = {
          headers,
          url: request.url(),
        };

        await chatByReviews({
          requestData,
          page,
          ...data,
        });
      }
    });

    await page.goto(url);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

async function chatByReviews({
  requestData,
  page,
  startPoint,
  iteration,
  template,
  shopId,
}) {
  const DEFAULT_LIMIT = 20;

  const { url, headers } = requestData;
  let endpoint = url.replace(/limit=\d+/, `limit=${DEFAULT_LIMIT}`);

  try {
    let chatCount = 0;

    while (chatCount < iteration) {
      let offset = +startPoint - 1;
      if (chatCount > 0) {
        offset = +startPoint + chatCount - 1;
      }

      endpoint = endpoint.replace(/offset=\d+/, `offset=${offset}`);

      const resReviews = await postGetUserReviews(endpoint, {
        headers,
      });

      let currentIndex = 0;
      console.log("Starting chat: ", { currentIndex, chatCount, iteration });

      while (chatCount < iteration && currentIndex < DEFAULT_LIMIT) {
        const reviewer = resReviews?.data?.data?.ratings[currentIndex];

        const resChat = await postShopeeMessage({
          payload: {
            to_id: reviewer?.userid,
            shop_id: shopId,
            content: {
              text: template,
            },
          },
          headers,
        });

        const username = reviewer?.author_username;

        if (resChat?.status === 200) {
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
              textContent: `Berhasil chat ke ${_username}`,
            });
          }, username);
        }

        await waitForTimeout(1000);
        currentIndex++;
        chatCount++;

        console.log({
          chatCount,
          status: resChat.status,
          username,
        });
      }
    }
    dialog.showMessageBox({
      message: `Program Telah Selesai`,
      buttons: ["OK"],
    });
  } catch (error) {
    await dialog.showMessageBox({
      message: `Terjadi kesalahan: ${error?.message}`,
      buttons: ["OK"],
    });
    console.log("Error: ", error?.message);
  }
}

module.exports = { runAutoChatByReviews };
