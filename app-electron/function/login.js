const os = require("os");
const { authenticateBot } = require("../api/interface");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { updateSubscriptionStatus } = require("../api/interface");
const { dialog } = require("electron");
const { DEFAULT_TIMEOUT, NO_TIMEOUT } = require("../constants/timeout");
const { URL_SELLER_SHOPEE } = require("../constants/url");
const { waitForTimeout } = require("../helpers/utils");

async function saveCookies(page, browser) {
  const cookies = await page.cookies();
  store.set("cookies-shopee-account", cookies);
}
async function loadCookiesShopee(page) {
  const cookieShopee = store.get("cookies-shopee-account");
  if (cookieShopee) {
    await page.setCookie(...cookieShopee);
  }
}

async function authenticateBotStatus(page, browser) {
  const accountSubscription = store.get("account-subscription");

  // fetch fingerprint
  const osVersion = os.version();
  const osArch = os.arch();
  const osPlatform = os.platform();
  const osType = os.type();
  const osRelease = os.release();
  const osHostName = os.hostname();
  const osHomeDir = os.homedir();
  const osCpus = JSON.stringify(
    os.cpus().map((o) => ({ model: o.model, speed: o.speed }))
  );
  const osTotalMem = os.totalmem();
  const osUserInfo = JSON.stringify(os.userInfo());
  const osEndianess = os.endianness();
  if (accountSubscription) {
    const payloadAuthBot = {
      email: accountSubscription.email,
      password: accountSubscription.password,
      subscriptionCode: accountSubscription.subscription,
      device_info: osVersion,
      fingerprint: {
        architecture: osArch,
        platform: osPlatform,
        release: osRelease,
        hostName: osHostName,
        homeDir: osHomeDir,
      },
      fingerprintV2: {
        osArch: osArch,
        osPlatform: osPlatform,
        osType: osType,
        osCpus: osCpus,
        osTotalMem: osTotalMem,
        osEndianess: osEndianess,
        osUserInfo: osUserInfo,
      },
    };
    try {
      if (accountSubscription) {
        const authenticateBotCookie = store.get("cookies-spt");
        const authenticateBotRes = await authenticateBot(payloadAuthBot, {
          headers: {
            Cookie: "",
          },
        });
        if (authenticateBotRes?.status == 405) {
          await page.evaluate(() => {
            window.alert("Akun sudah terhubung ke perangkat lain.");
          });
          await browser.close();
        } else if (authenticateBotRes?.status == 404) {
          await page.evaluate(() => {
            window.alert("Email tidak ditemukan.");
          });
          await browser.close();
        } else if (authenticateBotRes?.status == 403) {
          await page.evaluate(() => {
            window.alert(
              "Email / password salah. Periksa kembali data user info pada halaman akun shopee power tools."
            );
          });
          await browser.close();
        } else {
          const subscriptionData = authenticateBotRes.user.subscription;
          const authenticateBotResponse = {
            sessionId: authenticateBotRes?.sessionId,
            subscriptionData: authenticateBotRes.user,
          };

          if (subscriptionData.status !== "active") {
            await page.evaluate((subscriptionData) => {
              window.alert(
                `Status langganan ${subscriptionData.code} tidak aktif. Cek status langganan di menu dashboard atau hubungi admin.`
              );
            }, subscriptionData);
            await browser.close();
          } else if (subscriptionData.expiredAt) {
            const today = new Date();
            const expiryDate = new Date(subscriptionData.expiredAt);
            const data = {
              status: "inactive",
            };
            if (subscriptionData.status === "active" && today > expiryDate) {
              await updateSubscriptionStatus(data, {
                headers: {
                  Cookie: "connect.sid=" + authenticateBotResponse.sessionId,
                },
                params: {
                  id: subscriptionData.id,
                },
              });
              await page.evaluate((subscriptionData) => {
                window.alert(
                  `ID langganan ${subscriptionData.code} sudah melewati batas masa berlangganan (expired). Hubungi admin jika ingin melanjutkan berlangganan.`
                );
              }, subscriptionData);
              await browser.close();
            }
          }
          return authenticateBotResponse;
        }
      } else {
        await page.evaluate(() => {
          window.alert(
            "Harap isi terlebih dahulu account subcription shopee tools power kamu"
          );
        });
        await browser.close();
      }
    } catch (error) {
      console.log({ error });
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
      await page.evaluate(() => {
        window.alert("Gagal menghubungkan shopee power tools");
      });
      await browser.close();
      console.log(error);
    }
  } else {
    await page.evaluate(() => {
      window.alert(
        "Harap isi terlebih dahulu account subcription shopee tools power kamu"
      );
    });
    await browser.close();
  }
}

async function loginShopee(page, browser) {
  const resBotStatus = await authenticateBotStatus(page, browser);

  try {
    const cookieShopee = store.get("cookies-shopee-account");

    if (cookieShopee) {
      try {
        console.log("Cookies found. Logging in...");
        await loadCookiesShopee(page);
        await navigateToShopee(page);
      } catch (error) {
        console.log(
          "Invalid cookies or error during navigation. Clearing cookies and retrying login..."
        );
        console.log(error);
        store.delete("cookies-shopee-account");

        await loginToShopeeSeller(page);
      }
    } else {
      await loginToShopeeSeller(page);
    }
    return resBotStatus;
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

async function navigateToShopee(page) {
  console.log('navigating to "seller" page...');
  const MAX_RETRIES = 2;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      await page.goto(URL_SELLER_SHOPEE, {
        waitUntil: "networkidle2",
        timeout: DEFAULT_TIMEOUT,
      });

      if (page.url().includes(URL_SELLER_SHOPEE)) {
        console.log("Successfully navigated to Shopee seller page.");
        return;
      } else {
        throw new Error("Unable to navigate to the seller page.");
      }
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts} failed. Retrying...`);
      if (attempts === MAX_RETRIES) {
        dialog.showMessageBox({
          message: "Your cookies have expired. Please re-login.",
          buttons: ["OK"],
        });
        console.error(
          "Navigation failed after multiple attempts:",
          error?.message || error
        );
        throw error;
      }
    }
  }
}

async function loginToShopeeSeller(page) {
  const account = store.get("shopee-account");
  const loginMethod = account?.loginMethod || "qr-code";

  console.log(`No valid cookies found. Logging in with ${loginMethod}...`);

  try {
    const loginUrl =
      loginMethod === "qr-code"
        ? "https://shopee.co.id/seller/login/qr"
        : "https://shopee.co.id/seller/login";

    await page.goto(loginUrl, {
      waitUntil: "load",
      timeout: NO_TIMEOUT,
    });

    console.log("Navigated to login page. Entering credentials...");

    if (loginMethod === "contact") {
      const contactEl = await page.$('input[name="loginKey"]');
      await contactEl.click();
      await page.keyboard.type(account.contact);
      await page.keyboard.press("Tab");
      await page.keyboard.type(account.password);
      await page.keyboard.press("Enter");

      await page.waitForFunction(
        () => document.location.href.includes("?is_from_login=true"),
        { timeout: NO_TIMEOUT }
      );
    } else {
      await waitForTimeout(1000);

      const isQRExist = await page.evaluate(() => {
        const qrCode = document.querySelector(".CpMrRm.lI6EAf");
        return !!qrCode;
      });

      if (isQRExist) {
        console.log("QR code found. Waiting for user to scan...");
      } else {
        console.log("QR code not found...");
      }
    }

    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: NO_TIMEOUT,
    });

    console.log("Login successful. Saving cookies...");

    await saveCookies(page);

    if (!page.url().includes(URL_SELLER_SHOPEE)) {
      await navigateToShopee(page);
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

module.exports = { loginShopee };
