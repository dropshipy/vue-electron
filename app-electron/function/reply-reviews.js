const {
  waitForTimeout,
  generateCustomSelector,
  clickByText,
  checkSelector,
} = require("../helpers/utils");
const { filterReplyReviews } = require("./filter/reply-reviews");
const { dialog } = require("electron");
///selector in rating page
const textArea = "textarea.shopee-input__inner";
const pagination =
  "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.eds-react-pagination.my-6.text-center > div > button.eds-react-button.eds-react-pagination-pager__button.eds-react-pagination-pager__button-next.eds-react-button--frameless.eds-react-button--block.eds-react-button--small.eds-react-button--icon-only > span";

async function replyReviews({ page, config }) {
  console.log("run");
  try {
    const { replyMessage } = config;
    const loopCount = config.iteration;
    await page.goto("https://seller.shopee.co.id/portal/settings/shop/rating", {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    try {
      const modalNewTab = generateCustomSelector("h1", "Perubahan di Tab Data");

      if (modalNewTab) {
        await clickByText(page, "Mengerti");
      }
    } catch (error) {
      console.log("eror ni new tab", error);
    }
    await filterReplyReviews(page, config);
    let iteration = 1;
    let lastReview = false;

    while (loopCount >= iteration && lastReview == false) {
      const lastPagePagination =
        "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.eds-react-pagination.my-6.text-center > div > button.eds-react-button.eds-react-pagination-pager__button.eds-react-pagination-pager__button-next.eds-react-button--frameless.eds-react-button--block.eds-react-button--small.eds-react-button--icon-only.disabled";

      const isLastPage = await checkSelector(page, lastPagePagination);
      try {
        await page.waitForSelector(
          "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.bg-white.shadow-card.ratingListWrap-0-2-8 > div.rateStar-0-2-3 > div > div.relative.mt-4.flex.flex-col.gap-y-4 > div"
        );
        console.log("go 1");
        const cardReviews = await page.$$(
          "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.bg-white.shadow-card.ratingListWrap-0-2-8 > div.rateStar-0-2-3 > div > div.relative.mt-4.flex.flex-col.gap-y-4 > div > div.flex.divide-x.divide-[#e8e8e8].divide-solid > div.w-[250px].p-6.flex.justify-center > div > button"
        );
        console.log("go 2");
        await page.waitForTimeout(2000);
        console.log("go 3");
        console.log("cardReviews", cardReviews);
        console.log("cardReviews length", cardReviews.length);
        for (let i = 0; i < cardReviews.length; i++) {
          console.log("go 3");
          console.log("start");
          if (loopCount >= iteration) {
            const buttonReviews = cardReviews[i];

            const isDisabled = await page.evaluate(
              (button) => button.classList.contains("disabled"),
              buttonReviews
            );

            if (!isDisabled) {
              await cardReviews[i].evaluate((element) => {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              });
              await waitForTimeout(1);
              console.log("try click");
              await cardReviews[i].click();
              console.log("run 1");
              await page.waitForTimeout(2000);
              const modalReply = ".shopee-modal__header";
              await page.waitForSelector(modalReply);
              console.log("run 2");
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
      if (isLastPage) {
        lastReview = true;
      }
      await page.click(pagination);
      if (lastReview) {
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
          window.alert("Program Telah Selesai");
        });
      }
    }
  } catch (error) {
    await page.evaluate(() => {
      window.alert("Program Telah Selesai");
    });
    console.log(error.message);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
}

module.exports = { replyReviews };
