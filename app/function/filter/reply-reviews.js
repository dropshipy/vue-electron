//element filter
const inputProductName =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.rating-filter-wrapper > form > div.rating-filter > div:nth-child(1) > div > div > div > div > input";

const searchButton =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.rating-filter-wrapper > form > div.rating-action > div > div > div > button.shopee-button.shopee-button--primary.shopee-button--normal";
const tabMenu =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.content > div.tab-wrapper > div.shopee-tabs.shopee-tabs-line.shopee-tabs-normal.shopee-tabs-top > div.shopee-tabs__nav > div > div.shopee-tabs__nav-tabs > div:nth-child(2)";

async function filterReplyReviews(page, config) {
  const { productName, ratingComment } = config;

  if (productName) {
    await page.focus(inputProductName);
    await page.type(inputProductName, productName, { delay: 100 });
  }
  const [buttonRating] = await page.$x(
    `//span[contains(., '${ratingComment}')]`
  );
  if (ratingComment !== "semua") {
    await buttonRating.click();
  }
  await page.waitForSelector(tabMenu);
  await page.click(tabMenu);
  await page.click(searchButton);
}

module.exports = {
  filterReplyReviews,
};
