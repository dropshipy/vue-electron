const { app, BrowserWindow, ipcMain, session } = require("electron");
const puppeteer = require("puppeteer");
const path = require("node:path");
const fs = require("fs");
const os = require("os");
const { loginShopee } = require("./function/login");
const { autoUnfollow } = require("./function/auto-unfollow");
const { crawlCreator } = require("./function/invite-creator/crawl-creator");
const { replyReviews } = require("./function/reply-reviews");
const { dialog } = require("electron");
const axios = require("axios");
const { log } = require("node:console");
const { authenticateUser } = require("./function/authenticate-user");
const {
  authenticateUserShopeeTools,
} = require("./function/browser/authenticate-shopee-tools");
const { saveCookies, loadCookies } = require("./helpers/utils");
require("dotenv").config();
const ElectronStore = require("electron-store");
const { runAutoFollow } = require("./function/auto-follow/auto-follow");
const {
  runAutoFollowByReviews,
} = require("./function/auto-follow/auto-follow-by-reviews");
// determine chrome location
let chromePath = "invalid_os";
let isDev = process.resourcesPath.includes("node_modules");
let chromePathBasePath = process.resourcesPath;

if (isDev) {
  chromePathBasePath = "resources";
}

let arch = process.arch;
if (process.platform == "darwin") {
  if (arch == "arm64") {
    chromePath = path.join(
      chromePathBasePath,
      `chrome/mac_arm-119.0.6045.105/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
    );
  } else {
    chromePath = path.join(
      chromePathBasePath,
      `chrome/mac-119.0.6045.105/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
    );
  }
} else if (process.platform == "win32") {
  chromePath = path.join(
    chromePathBasePath,
    `chrome/win64-119.0.6045.105/chrome-win64/chrome.exe`
  );
}

console.log("Chromium executable path:", chromePath);

let mainWindow;
// Store the authentication cookie globally
let authenticationCookie;
const store = new ElectronStore();
const baseUrlProd = "https://supportseller.com/api";
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["self"],
          scriptSrc: ["self"],
          styleSrc: ["self"],
        },
      },
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.on("ready", () => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on("post-cookies-shopee-tools", async (event, payload) => {
    await authenticateUserShopeeTools(payload);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});

// scrapper
ipcMain.on("process-auto-unfollow", (event, data) => {
  handleAutoUnfolow(data);
});
async function handleAutoUnfolow(iteration) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1300,
      height: 1080,
      deviceScaleFactor: 1,
    });
    const context = {
      iteration,
      page,
    };
    await loginShopee(page, browser);
    await autoUnfollow(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

ipcMain.on("crawl-creator", (event, data) => {
  console.log(data);
  handleCrawlCreator(data);
});
async function handleCrawlCreator(config) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1350,
      height: 700,
      deviceScaleFactor: 1,
    });
    const loginShopeeBotRes = await loginShopee(page, browser);
    const context = {
      page,
      loginShopeeBotRes,
      config,
    };
    await crawlCreator(context);
  } catch (error) {
    console.error("Error in the main process:", error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
}
ipcMain.on("process-reply-reviews", (event, data) => {
  runReplyReviews(data);
});
async function runReplyReviews(config) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1300,
      height: 800,
      deviceScaleFactor: 1,
    });
    const loginShopeeBotRes = await loginShopee(page, browser);
    const context = {
      page,
      loginShopeeBotRes,
      config,
    };
    await replyReviews(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}
// https://shopee.co.id/shop/113475604/following
ipcMain.on("process-auto-follow", async (event, data) => {
  try {
    const context = {
      chromePath,
      iteration: data,
    };
    await runAutoFollow(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

//autofollow by reviews
ipcMain.on("process-auto-follow-by-reviews", async (event, data) => {
  try {
    const context = {
      chromePath,
      data,
    };
    await runAutoFollowByReviews(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

ipcMain.on("get-subscription-info", async () => {
  const res = await axios.get(
    `https://supportseller.com/api/shopee-subscriptions`,
    {
      headers: {
        Cookie: store.get("cookies-spt"),
      },
    }
  );
  store.set("data-subscription", res.data);
});
ipcMain.on("get-database-creator", async (event, data) => {
  try {
    const res = await axios.get(
      `https://supportseller.com/api/shopee/shopee-creators`,
      {
        headers: {
          Cookie: store.get("cookies-spt"),
        },
        params: data,
      }
    );
    store.set("database-creator", res.data);
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// function authenticateUser() {
//   // Simulate an authentication request and return the obtained cookie
//   return new Promise((resolve, reject) => {
//     // Your authentication logic here, for example using axios
//     axios
//       .post("http://localhost:3000/api/users/authenticate", {
//         email: "zu@gmail",
//         password: "qwe",
//       })
//       .then((response) => {
//         // Assuming the authentication endpoint returns a 'Set-Cookie' header
//         const setCookieHeader = response.headers["set-cookie"];
//         console.log(setCookieHeader);
//         if (setCookieHeader) {
//           // Check if setCookieHeader is an array (multiple cookies) or a string (single cookie)
//           const cookies = Array.isArray(setCookieHeader)
//             ? setCookieHeader
//             : [setCookieHeader];

//           // Extract the first cookie
//           const cookie = cookies[0].split(";")[0];

//           resolve(cookie);
//         } else {
//           reject(new Error("Authentication failed."));
//         }
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// }

function makeApiRequest() {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get("http://localhost:3000/api/shopee/message-blast/7", {
          headers: {
            Cookie: authenticationCookie,
          },
        })
        .then((response) => {
          if (response.data) {
            console.log(response.data);
            resolve(response.data);
          } else reject(new Error("api failed."));
        });
    } catch (error) {
      console.log("API eror", error);
      reject(error);
    }
  });
}
