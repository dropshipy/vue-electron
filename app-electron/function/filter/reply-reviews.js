//element filter
const inputProductName =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.rating-filter-wrapper > form > div.rating-filter > div:nth-child(1) > div > div > div > div > input";

const searchButton = "#searchRequest";
const tabMenu =
  "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.bg-white.shadow-card.ratingListWrap-0-2-8 > div.flex.items-center.mt-6 > div:nth-child(3)";

async function filterReplyReviews(page, config) {
  try {
    const { productName, ratingComment } = config;

    if (productName) {
      await page.focus(inputProductName);
      await page.type(inputProductName, productName, { delay: 100 });
    }
    const [buttonRating] = await page.$x(
      `//span[contains(., '${ratingComment}')]`
    );
    if (ratingComment !== "semua" && ratingComment) {
      await buttonRating.click();
    }
    await page.waitForSelector(tabMenu);
    await page.click(tabMenu);
    await page.click(searchButton);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  filterReplyReviews,
};
