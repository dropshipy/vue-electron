const puppeteer = require("puppeteer");
const { dialog } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
async function runAutoFollow({ page, iteration }) {
  try {
    const url = store.get("link-auto-follow");
    console.log({ url });
    console.log({ iteration });
    await page.emulate(puppeteer.devices["iPhone 13 Pro Max"]);
    await page.goto(url);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}
module.exports = { runAutoFollow };
