const { waitForTimeout } = require("../helpers/utils");
const { filterReplyReviews } = require("./filter/reply-reviews");
const { dialog } = require("electron");

///selector in rating page
const textArea = "textarea.shopee-input__inner";
const pagination =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.pagination.shopee-pagination > div > button.shopee-button.shopee-button--small.shopee-button--frameless.shopee-button--block.shopee-pager__button-next > i";

async function replyReviews({ page, config }) {
  try {
    const { replyMessage } = config;
    const loopCount = config.iteration;
    await page.goto("https://seller.shopee.co.id/portal/settings/shop/rating", {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    await filterReplyReviews(page, config);
    let iteration = 1;
    let lastReview = false;

    while (loopCount >= iteration && lastReview == false) {
      const lastPagePagination = await page.$(
        "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.pagination.shopee-pagination > div > button.shopee-button.shopee-button--small.shopee-button--frameless.shopee-button--block.disabled.shopee-pager__button-next"
      );
      try {
        await page.waitForSelector(".comment");

        const cardReviews = await page.$$("div.column.reply.toreply > button ");
        await page.waitForTimeout(2000);
        for (let i = 0; i < cardReviews.length; i++) {
          console.log("start");
          if (loopCount >= iteration) {
            const buttonReviews = cardReviews[i];

            const isDisabled = await page.evaluate(
              (button) => button.classList.contains("disabled"),
              buttonReviews
            );

            if (!isDisabled) {
              console.log("run....");
              await cardReviews[i].evaluate((element) => {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              });
              await waitForTimeout(1);
              await cardReviews[i].click();
              await page.waitForTimeout(2000);
              const modalReply = ".shopee-modal__header";
              await page.waitForSelector(modalReply);
              await page.waitForTimeout(1000);
              await page.waitForSelector(textArea);
              await page.focus(textArea);
              await page.type(textArea, replyMessage, { delay: 50 });
              await page.click(
                "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.content > div:nth-child(4) > div > div > div > div > div.shopee-modal > div > div > div > div > div.shopee-modal__footer > div > button.shopee-button.shopee-button--primary.shopee-button--normal"
              );
              await page.waitForSelector(modalReply, { hidden: true });
              console.log(iteration, "Berhasil membalas ulasan");
              iteration++;
            }
          } else {
            i = cardReviews.length;
            await page.evaluate(() => {
              window.alert("Program Power Tools Selesai");
            });
          }
        }
      } catch (error) {
        console.log(error.message);
        await page.evaluate(() => {
          window.alert("Program telah selesai");
        });
        dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
        console.log(error);
      }
      if (lastPagePagination) {
        lastReview = true;
      }
      await page.click(pagination);
      if (lastReview) {
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
          window.alert("Program Shopee Power Tools Telah Selesai");
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
}

module.exports = { replyReviews };
