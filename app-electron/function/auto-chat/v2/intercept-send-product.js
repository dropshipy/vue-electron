const {
  clickByText,
  waitForTimeout,
  generateCustomSelector,
} = require("../../../helpers/utils");

const sendProductBtn =
  "#root > div.NsRmaKw72q > div.y4F28I1Q2N > div.GpaQAzyZwN > div > div.hfZWokKI0V > div.T9dwWBKsWn > div > div > div > div.shopee-react-checkbox-group > div > section > div.TpaWfMRThd > div > div > div > div > div.mi5pa49_U0 > div.NSGsJzUkfg > div.K1AEFgBLRQ.b5PN3ddbxd";

const interceptSendProduct = async ({ page, author_username, productName }) => {
  try {
    const author = replaceStars(author_username);
    const inputEl = await page.$('input[placeholder="Cari Semua"]');
    await inputEl.click({ clickCount: 3 });
    await inputEl.press("Backspace");
    await page.waitForTimeout(300);

    await page.focus('input[placeholder="Cari Semua"]');

    await page.type('input[placeholder="Cari Semua"]', author, {
      delay: 100,
    });

    const authorCardChat = `div.RWr1KSlda2[title="${author}"]`;
    await page.waitForSelector(authorCardChat, { timeout: 5000 });
    await waitForTimeout(500);

    await page.click(authorCardChat);
    await waitForTimeout(500);

    // send product
    await clickByText(page, "PRODUK");

    await page.focus('input[placeholder="Cari Nama Produk"]');

    await page.type('input[placeholder="Cari Nama Produk"]', productName);
    await waitForTimeout(500);

    let isLoadingGetProduct = false;

    await page.setRequestInterception(true);
    page.on("requestfinished", async (request) => {
      if (request.url().includes("webchat/api/v1.2/products/list?")) {
        isLoadingGetProduct = true;
      }
    });

    let getProductCounter = 0;

    while (!isLoadingGetProduct && getProductCounter < 3) {
      await waitForTimeout(500);
      getProductCounter++;
    }

    await clickByText(page, "Kirim");

    // await page.click(sendProductBtn);
  } catch (error) {
    console.log(error);
  }
};

const replaceStars = (input) => {
  let newData = input.replace(/^\*+|\*+$/g, "***");

  newData = newData.replace(/\*{4,}/g, "***");

  return newData;
};

module.exports = { interceptSendProduct };
