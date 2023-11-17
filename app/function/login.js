const puppeteer = require("puppeteer");
const fs = require("fs");
const os = require("os");
const path = require("node:path");
const { authenticateBot } = require("../api/interface");
const { loadCookies } = require("../helpers/utils");
const COOKIES_PATH = path.join(__dirname, "../store/cookies.json");
const accountSubscriptionPath = path.join(
  __dirname,
  "../store/account-subscription.json"
);

async function saveCookies(page, browser) {
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies));
}
async function loadCookiesShopee(page) {
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf-8"));
    await page.setCookie(...cookies);
  }
}

async function authenticateBotStatus(page, browser) {
  const accountSubscription = await loadCookies(accountSubscriptionPath);

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
      const authenticateBotCookie = "";
      const authenticateBotRes = await authenticateBot(payloadAuthBot, {
        headers: {
          Cookie: authenticateBotCookie,
        },
      });
      if (authenticateBotRes?.status == 405) {
        await page.evaluate(() => {
          window.alert(
            "Akun sudah terhubung ke perangkat lain. Cek perangkat terhubung di halaman dashboard."
          );
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
        const authenticateBotResponse = {
          sessionId: authenticateBotRes?.sessionId,
          subscriptionData: authenticateBotRes.user.subscription,
        };
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
    console.log(error);
  }
}

async function loginShopee(page, browser) {
  const resBotStatus = await authenticateBotStatus(page, browser);
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      try {
        console.log("Cookies found. Logging in...");
        await loadCookiesShopee(page);
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded" }),
          page.goto("https://seller.shopee.co.id", {
            waitUntil: "networkidle2",
          }),
        ]);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("No cookies found. Logging in with barcode...");
      try {
        await page.goto("https://shopee.co.id/seller/login/qr", {
          waitUntil: "networkidle2",
          timeout: 0,
        });
        await page.waitForNavigation();
        console.log("Login successful. Saving cookies...");
        await saveCookies(page);
      } catch (error) {
        console.error("Error during login:", error);
      }
    }
    return resBotStatus;
  } catch (error) {
    console.error("Error in the main process:", error);
  }
}

module.exports = { loginShopee };
