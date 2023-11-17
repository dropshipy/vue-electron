const { filterReplyReviews } = require("./filter/reply-reviews");

///selector in rating page
const tabMenu =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.content > div.tab-wrapper > div.shopee-tabs.shopee-tabs-line.shopee-tabs-normal.shopee-tabs-top > div.shopee-tabs__nav > div > div.shopee-tabs__nav-tabs > div:nth-child(2)";
const textArea = "textarea.shopee-input__inner";
const pagination =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.pagination.shopee-pagination > div > button.shopee-button.shopee-button--small.shopee-button--frameless.shopee-button--block.shopee-pager__button-next > i";
const lastPagePagination =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.pagination.shopee-pagination > div > button.shopee-button.shopee-button--small.shopee-button--frameless.shopee-button--block.disabled.shopee-pager__button-next";
async function replyReviews({ page, config }) {
  const { replyMessage } = config;
  const loopCount = config.iteration;
  await page.goto("https://seller.shopee.co.id/portal/settings/shop/rating", {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.waitForSelector(tabMenu);
  await filterReplyReviews(page, config);
  await page.click(tabMenu);
  let iteration = 1;
  let lastReview = false;
  while (loopCount >= iteration && !lastReview) {
    try {
      console.log("run");
      await page.waitForSelector(".comment");
      const cardReviews = await page.$$("div.column.reply.toreply > button");
      await page.waitForTimeout(2000);
      for (let i = 0; i < cardReviews.length; i++) {
        if (loopCount >= iteration) {
          await cardReviews[i].click();
          const modalReply = await page.waitForSelector(".shopee-modal__box");
          if (modalReply) {
            await page.waitForTimeout(2000);
            await page.click(textArea);
            await page.focus(textArea);
            await page.type(textArea, replyMessage, { delay: 100 });
            await page.waitForTimeout(2000);
            await page.click(
              "div.shopee-modal__footer > div > button.shopee-button"
            );
            console.log(iteration, "Berhasil membalas ulasan");
            iteration++;
          }
        } else {
          i = cardReviews.length;
          await page.evaluate(() => {
            window.alert("Program Tikblast Selesai");
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
    if (lastPagePagination) {
      lastReview = true;
    }
    await page.click(pagination);
  }
  if (lastReview) {
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      window.alert("Program Shopee Blast Telah Selesai");
    });
  }
}

module.exports = { replyReviews };
