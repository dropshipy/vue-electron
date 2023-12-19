const puppeteer = require("puppeteer");
const { dialog } = require("electron");

async function clickButtonByIteration(page, count) {
  try {
    await page.waitForSelector("button", { timeout: 5000 });

    const buttons = await page.$$("button");
    if (buttons.length > 0) {
      for (let i = 0; i < Math.min(count, buttons.length); i++) {
        await page.waitForTimeout(1000);
        // await buttons.click();

        await page.evaluate((element) => {
          element.click();
        }, buttons[i]);
      }
    }
  } catch (error) {
    console.error("Error clicking buttons:", error);
  }
}
async function autoUnfollow({ page, iteration }) {
  const shopeeProfile = [];
  page.on("response", async (response) => {
    if (
      response.url().includes("https://shopee.co.id/api/v4/account/get_profile")
    ) {
      const responseData = await response.json();
      const data = responseData.data;

      shopeeProfile.push(data);
    }
  });

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.goto("https://shopee.co.id/user/account/profile", {
      waitUntil: "networkidle2",
    }),
  ]);

  if (shopeeProfile.length > 0) {
    await page.emulate(puppeteer.devices["iPhone 11"]);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.goto(
        `https://shopee.co.id/shop/${shopeeProfile[0].user_profile.shopid}/following`,
        {
          waitUntil: "networkidle2",
        }
      ),
    ]);
    try {
      console.log("run", { iteration });
      await scrollAndHandleModal(page);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      if (iteration == "Semua") {
        const buttons = await page.$$("button");

        for (const button of buttons) {
          await page.waitForTimeout(1000);
          await button.evaluate((element) => {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          });
          await button.click();
        }
      } else {
        await clickButtonByIteration(page, iteration);
      }
      await page.waitForTimeout(2000);
      await page.evaluate(() => {
        window.alert("Program Unffollow Otomatis Telah Selesai");
      });
    } catch (error) {
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
      console.log("error", error);
    }
  }
}
async function scrollAndHandleModal(page) {
  await page.evaluate(() => {
    window.scrollBy(0, 100);
  });

  await page.waitForSelector("#modal > aside > div.c7huf3.undefined > div", {
    timeout: 5000,
  });

  await page.click(
    "#modal > aside > div.c7huf3.undefined > div > button.Y47Tdy.bOZVyD"
  );
}

module.exports = { autoUnfollow };
