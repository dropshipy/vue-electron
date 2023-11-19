const { app, BrowserWindow, ipcMain, session } = require("electron");
const puppeteer = require("puppeteer");
const path = require("node:path");
const fs = require("fs");
const { loginShopee } = require("./function/login");
const { autoUnfollow } = require("./function/auto-unfollow");
const { crawlCreator } = require("./function/invite-creator/crawl-creator");
const { replyReviews } = require("./function/reply-reviews");
const axios = require("axios");
const { log } = require("node:console");
const { authenticateUser } = require("./function/authenticate-user");
const {
  authenticateUserShopeeTools,
} = require("./function/browser/authenticate-shopee-tools");
const { saveCookies, loadCookies } = require("./helpers/utils");
require("dotenv").config();
const ElectronStore = require("electron-store");
const { dialog } = require('electron')

const COOKIES_PATH = path.join(__dirname, "./store/cookies.json");
const USER_CONFIG_PATH = path.join(__dirname, "./store/user-config.json");
const COOKIES_SHOPEE_TOOLS_PATH = path.join(
  __dirname,
  "./store/cookies-shopee-tools.json"
);
const ACCOUNT_SUBSCRIPTION_PATH = path.join(
  __dirname,
  "./store/account-subscription.json"
);

const crawlCreatorConfigPath = path.join(
  __dirname,
  "./store/user-crawl-creator-config.json"
);
const replyReviewsConfigPath = path.join(
  __dirname,
  "./store/reply-reviews-config.json"
);


let mainWindow;
// Store the authentication cookie globally
let authenticationCookie;
const store = new ElectronStore();
const baseUrlProd = "http://supportseller.com/api";
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

  // handle api crawl creator config
  ipcMain.on("get-crawl-creator-config", async (event, subscriptionId) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    const res = await axios.get(
      `${baseUrlProd}/shopee/message-blast/${subscriptionId}`,
      {
        headers: {
          Cookie: cookies,
        },
      }
    );

    saveCookies(crawlCreatorConfigPath, res.data);
  });
  ipcMain.on("data-to-html", async (event, data) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    const res = await axios.get(`${baseUrlProd}/shopee/shopee-creators`, {
      headers: {
        Cookie: cookies,
      },
    });
    mainWindow.webContents.send("data-to-fe", res.data);
  });
  ipcMain.on("update-crawl-creator-config", async (event, payload) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    try {
      const res = await axios.patch(
        `${baseUrlProd}/shopee/message-blast/${payload.userId}`,
        payload,
        {
          headers: {
            Cookie: cookies,
          },
        }
      );
    } catch (error) {
      console.log("Error patch api user crawl creator config", error);
    }
  });
  ipcMain.on("post-crawl-creator-config", async (event, payload) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    const res = await axios.post(
      `${baseUrlProd}/shopee/message-blast`,
      payload,
      {
        headers: {
          Cookie: cookies,
        },
      }
    );
    saveCookies(crawlCreatorConfigPath, res.data);
    console.log("status", res.status, res.data);
  });
  // end

  // handle api reply reviews config
  ipcMain.on("get-reply-reviews-config", async (event, subscriptionId) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    const res = await axios.get(
      `${baseUrlProd}/shopee/reply-reviews/${subscriptionId}`,
      {
        headers: {
          Cookie: cookies,
        },
      }
    );

    saveCookies(replyReviewsConfigPath, res.data);
  });
  ipcMain.on("post-reply-reviews-config", async (event, payload) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    const res = await axios.post(
      `${baseUrlProd}/shopee/reply-reviews`,
      payload,
      {
        headers: {
          Cookie: cookies,
        },
      }
    );
    console.log("status", res.status, res.data);
  });
  ipcMain.on("update-reply-reviews-config", async (event, payload) => {
    const cookies = await loadCookies(COOKIES_SHOPEE_TOOLS_PATH);
    try {
      const res = await axios.patch(
        `${baseUrlProd}/shopee/reply-reviews/${payload.userId}`,
        payload,
        {
          headers: {
            Cookie: cookies,
          },
        }
      );
    } catch (error) {
      console.log("Error patch api user crawl creator config", error);
    }
  });
  // end
  ipcMain.on("delete-cookies-shopee-tools", () => {
    const cookiesShopeeTools = path.join(
      __dirname,
      "./store/cookies-shopee-tools.json"
    );
    try {
      if (fs.existsSync(cookiesShopeeTools)) {
        fs.unlinkSync(cookiesShopeeTools);
        console.log("Cookies deleted successfully");
      } else {
        console.log("Cookies file not found");
      }
    } catch (error) {
      console.error("Error deleting cookies:", error);
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  ipcMain.on("delete-cookies-bot", () => {
    const cookiesPath = path.join(__dirname, "./store/cookies.json");

    try {
      if (fs.existsSync(cookiesPath)) {
        fs.unlinkSync(cookiesPath);
        console.log("Cookies deleted successfully");
      } else {
        console.log("Cookies file not found");
      }
    } catch (error) {
      console.error("Error deleting cookies:", error);
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
    console.error("Error in the main process:", error);
  }
}

ipcMain.on("crawl-creator", (event, data) => {
  console.log(data);
  handleCrawlCreator(data);
});
async function handleCrawlCreator(config) {
  try {
    // Outputs the path to the Chromium executable
    // resources\chrome\win64-119.0.6045.105\chrome-win64\chrome.exe
    // const executablePath = await puppeteer.executablePath();
    // const appPath = app.getAppPath();
    let executablePath = "invalid_os";
    let isDev = process.resourcesPath.includes("node_modules")
    let executablePathBasePath = process.resourcesPath

    if (isDev) {
      executablePathBasePath = "resources"
    }

    if (process.platform == "darwin") {
      executablePath = path.join(executablePathBasePath, `chrome/mac-119.0.6045.105/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`)
    } else if (process.platform == "win32") {
      executablePath = path.join(executablePathBasePath, `chrome/win64-119.0.6045.105/chrome-win64/chrome.exe`)
    }
    console.log('Chromium executable path:', executablePath);
    dialog.showMessageBox({ message: executablePath, buttons: ["OK"] }); 
    // Launch Puppeteer with the dynamically obtained executable path
    const browser = await puppeteer.launch({
      executablePath,
      headless: false,
      defaultViewport: null,
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
    console.error("Error in the main process:", error);
  }
}
ipcMain.on("get-database-creator", async (event, data) => {
  forwardCreator(res);
});
//end
ipcMain.on("account-subscription", (event, data) => {
  fs.writeFileSync(ACCOUNT_SUBSCRIPTION_PATH, JSON.stringify(data));
});

ipcMain.on("get-subscription-info", async () => {
  const res = await axios.get(
    `http://supportseller.com/api/shopee-subscriptions`,
    {
      headers: {
        Cookie: store.get("cookies-spt"),
      },
    }
  );
  store.set("data-subscription", res.data);
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
