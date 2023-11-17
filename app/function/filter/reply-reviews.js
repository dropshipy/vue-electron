//element filter
const inputProductName =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.rating-filter-wrapper > form > div.rating-filter > div:nth-child(1) > div > div > div > div > input";

const searchButton =
  "#app > div.app-container > div.page-container.has-sidebar > div > div > div > div.rating > div.rating-filter-wrapper > form > div.rating-action > div > div > div > button.shopee-button.shopee-button--primary.shopee-button--normal";
async function filterReplyReviews(page, config) {
  const { productName, ratingComment } = config;

  if (productName) {
    await page.focus(inputProductName);
    await page.type(inputProductName, productName, { delay: 100 });
  }
  const [buttonRating] = await page.$x(
    `//span[contains(., '${ratingComment}')]`
  );

  if (ratingComment !== "Semua") {
    await buttonRating.click();
  }
  await page.click(searchButton);
}

module.exports = {
  filterReplyReviews,
};
