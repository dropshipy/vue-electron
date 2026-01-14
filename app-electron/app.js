require("dotenv").config({ path: __dirname + "/../.env" });

const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

autoUpdater.setFeedURL({
  provider: "github",
  owner: "dropshipy",
  repo: process.env.REPO,
  token: process.env.GITHUB_TOKEN,
});

const puppeteer = require("puppeteer-extra");
const path = require("node:path");
const { loginShopee } = require("./function/login");
const { autoUnfollow } = require("./function/auto-unfollow");
const { crawlCreator } = require("./function/invite-creator/crawl-creator");
const { replyReviews } = require("./function/reply-reviews");
const { dialog } = require("electron");
const axios = require("axios");
const express = require("express");
const {
  authenticateUserShopeeTools,
} = require("./function/browser/authenticate-shopee-tools");
const ElectronStore = require("electron-store");
const { runAutoFollow } = require("./function/auto-follow/auto-follow");
const {
  runAutoFollowByReviews,
} = require("./function/auto-follow/auto-follow-by-reviews");
const {
  runAutoChatByReviews,
} = require("./function/auto-chat/auto-chat-by-reviews");
const { getApiBaseUrl } = require("./helpers/api-url");
const {
  AutoReplyReviewsByApi,
} = require("./function/reply-reviews-by-api/AutoReplyReviewsByApi");
const {
  runAutoChatByReviewsV2,
} = require("./function/auto-chat/v2/auto-chat-by-reviews-v2");
const { exportDataToSheet } = require("./function/export-data-to-sheet");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { getTikblastSubscriptions, getDatabaseCreators, getSavedCreators } = require("./api/interface");
const { saveTokens } = require("./function/authenticate-user");
puppeteer.use(StealthPlugin());

const store = new ElectronStore();

// determine chrome location
let chromePath = "invalid_os";
let isDev = process.resourcesPath.includes("node_modules");
let chromePathBasePath = process.resourcesPath;

if (isDev) {
  chromePathBasePath = "resources";
}
let arch = process.arch;
const selectedBrowser = store.get("browser-choice");

if (selectedBrowser && !selectedBrowser?.isChromium) {
  chromePath = selectedBrowser.browserPath;
} else {
  if (process.platform == "darwin") {
    if (arch == "arm64") {
      chromePath = path.join(
        chromePathBasePath,
        `chrome/chrome-mac-arm/Chromium.app/Contents/MacOS/Chromium`
      );
    } else {
      chromePath = path.join(
        chromePathBasePath,
        `chrome/mac-129.0.6668.89/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
      );
    }
  } else if (process.platform == "win32") {
    chromePath = path.join(
      chromePathBasePath,
      `chrome/win64-119.0.6045.105/chrome-win64/chrome.exe`
    );
  }
}

console.log("Chromium executable path:", chromePath);

let mainWindow;
// Store the authentication cookie globally
let authenticationCookie;

const BASE_URL = getApiBaseUrl();

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
  if (process.env.ENTRY_SOURCE === "dev_server") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    mainWindow.setFullScreen(true);
  } else {
    const appServer = express();

    // Specify the directory you want to serve files from
    const directoryPath = path.join(__dirname, "dist");

    // Serve all files in the specified directory
    appServer.use(express.static(directoryPath));

    // Start the server on a specific port (e.g., 9999)

    const PORT = process.env.PORT || 9889;
    appServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    mainWindow.loadURL("http://localhost:9889");
  }
}

app.on("ready", () => {
  createWindow();
  // mainWindow.webContents.send("update_not_available", false);
  // dialog.showMessageBox({
  //   type: "info",
  //   title: "Update Available",
  //   message: "New version available. New application will automatically update.",
  // });
  // setTimeout(() => {
  //   let percent = 0;
  //   mainWindow.webContents.send("update_available", true);
  //   const progressInterval = setInterval(() => {
  //     percent += 10;
  //     mainWindow.webContents.send("download_progress", { percent });
  //     if (percent >= 100) {
  //       clearInterval(progressInterval);
  //       mainWindow.webContents.send("update_downloaded");
  //     }
  //   }, 500);
  // }, 2000);

  app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on("post-cookies-shopee-tools", async (event, payload) => {
    await authenticateUserShopeeTools(payload);
  });

   // Handle JWT token saving
  ipcMain.on("save-jwt-tokens", async (event, tokens) => {
    await saveTokens(tokens);
  });
});

ipcMain.on("check-for-update", () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available", true);
});
autoUpdater.on("update-not-available", () => {
  mainWindow.webContents.send("update_not_available", false);
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Ready",
      message:
        "Update has been downloaded, the application will restart to apply the update.",
    })
    .then(() => {
      autoUpdater.quitAndInstall();
    });
  // autoUpdater.quitAndInstall();
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`
  );
  mainWindow.webContents.send("download_progress", progressObj);
});

autoUpdater.on("error", (error) => {
  const dataSubscription = store.get("account-subscription")

  if (dataSubscription?.email === "dwibagaskara55@gmail.com" || dataSubscription?.email === 'zuhriyal') {
    dialog.showErrorBox("Update Error", error?.stack || error.toString());
  }
});

// scrapper
ipcMain.handle("process-auto-unfollow", async (event, data) => {
  await handleAutoUnfolow(data);
});
async function handleAutoUnfolow(iteration) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath,
    });
    const pages = await browser.pages();
    const page = pages[0];
    await page.setViewport({
      width: 1300,
      height: 1080,
      deviceScaleFactor: 1,
    });
    const context = {
      iteration,
      page,
      browser,
    };
    await loginShopee(page, browser);
    await autoUnfollow(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

ipcMain.handle("crawl-creator", async (event, data) => {
  const config = data.context;
  const subscriptionId = data.subscriptionId;
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath,
    });
    const pages = await browser.pages();
    const page = pages[0];

    await page.setViewport({ width: 1366, height: 768 });

    const { screenWidth, screenHeight } = await page.evaluate(() => {
      return {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height - 200,
      };
    });
    await page.setViewport({
      width: screenWidth,
      height: screenHeight,
    });

    // Simulate network conditions
    // const slow3G = puppeteer.PredefinedNetworkConditions["Fast 3G"];
    // await page.emulateNetworkConditions(slow3G);

    const loginShopeeBotRes = await loginShopee(page, browser);
    console.log("login shopee success");
    const context = {
      page,
      loginShopeeBotRes,
      config,
      browser,
      subscriptionId,
    };
    await crawlCreator(context);
  } catch (error) {
    console.error("Error in the main process:", error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("process-reply-reviews", async (event, data) => {
  await runReplyReviews(data);
});
async function runReplyReviews(config) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath,
    });
    const pages = await browser.pages();
    const page = pages[0];

    const { screenWidth, screenHeight } = await page.evaluate(() => {
      return {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height - 200,
      };
    });
    await page.setViewport({
      width: screenWidth,
      height: screenHeight,
    });
    const loginShopeeBotRes = await loginShopee(page, browser);
    const context = {
      page,
      loginShopeeBotRes,
      config,
    };
    await AutoReplyReviewsByApi(context);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}
// https://shopee.co.id/shop/113475604/following
ipcMain.handle("process-auto-follow", async (event, data) => {
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
//NOTE - have traffic bot in api shopee
ipcMain.handle("process-auto-follow-by-reviews", async (event, data) => {
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

ipcMain.on("process-auto-chat-by-reviews", async (_, data) => {
  try {
    // await runAutoChatByReviews({ chromePath, data });
    await runAutoChatByReviewsV2({ chromePath, data });
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

ipcMain.handle("get-subscription-info", async () => {
  try {
    const res = await getTikblastSubscriptions()
    const dataSubscription = store.get("account-subscription") || {};
    store.set("account-subscription", {
      ...dataSubscription,
      subscription: res.data?.data?.code,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching subscription info:", error.message);
    throw error.message;
  }
});

ipcMain.handle("get-database-creator-shopee", async (event, data) => {
  try {
    const res = await getDatabaseCreators({ params: data })
    console.log('database:', res.data)
    store.set("database-creator-shopee", res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    if (!error.data.message.includes('unauthorized')) {
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    }
  }
});

ipcMain.handle(
  "get-subscription-creator-shopee",
  async (event, { payload, subscriptionId }) => {
    try {
      const res = await getSavedCreators({ params: {
        subscriptionId
      }, options: {
        params: payload
      } })
      return res.data;
    } catch (error) {
      console.log(error.data.error);
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    }
  }
);

// ipcMain.handle("export-data-to-excel", async (event, data) => {
//   const resData = await exportDataToSheet({ ...data, BASE_URL, store });
//   return resData;
// });

app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
    app.quit();
  // }
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
