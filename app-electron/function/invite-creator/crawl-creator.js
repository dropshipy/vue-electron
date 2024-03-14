const { filterCreator } = require("../filter/filter-creator");
const { waitForTimeout } = require("../../helpers/utils");
const { messageBlast } = require("./message-blast");

async function crawlCreator({ page, loginShopeeBotRes, config, browser }) {
  try {
    const context = {
      page,
      requestData: null,
      categorySetting: null,
      config: {
        configMessageBlast: {
          ...config,
        },
      },
      authBotRes: {
        ...loginShopeeBotRes,
      },
      browser,
    };
    const reqListData = [];

    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      if (
        request
          .url()
          .startsWith(
            "https://seller.shopee.co.id/api/v1/affiliateplatform/creator/list"
          )
      ) {
        const information = {
          url: request.url(),
          requestHeaders: request.headers(),
          requestPostData: request.postData(),
        };
        reqListData.push(information);
        request.continue();
      } else {
        request.continue();
      }
    });
    await Promise.all([
      page.goto(
        "https://seller.shopee.co.id/portal/web-seller-affiliate/kol_marketplace",
        {
          waitUntil: "networkidle0",
        }
      ),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);
    let loadingCategories = true;
    const reqCategories = [];
    page.on("response", async (response) => {
      if (
        response
          .url()
          .includes(
            "https://seller.shopee.co.id/api/v1/affiliateplatform/commissions/category_setting"
          )
      ) {
        const responseData = await response.json();
        const data = responseData.data.category_list;
        const infoCategory = data;
        if (infoCategory) {
          reqCategories.push(infoCategory);
          loadingCategories = false;
        }
      }
    });
    let counter = 1;
    if (context.config) {
      while (loadingCategories) {
        if (counter <= 5) {
          await waitForTimeout(500);
          counter++;
        } else {
          await page.reload({ waitUntil: "networkidle0" });
        }
      }
      await filterCreator(context);
      if (reqListData.length > 0) {
        await waitForTimeout(5000);
        context.requestData = reqListData[reqListData.length - 1];
        context.categorySetting = { reqCategories };
        await messageBlast(context);
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

module.exports = { crawlCreator };
