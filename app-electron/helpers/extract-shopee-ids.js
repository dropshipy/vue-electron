/**
 * Support 2 formats:
 * - https://shopee.co.id/product/{shopId}/{itemId}
 * - https://shopee.co.id/slug-i.{shopId}.{itemId}
 */
const extractIdsFromProductUrl = (url) => {
  const regex =
    /shopee\.co\.id\/product\/(\d+)\/(\d+)|shopee\.co\.id\/[^\/]+-i\.(\d+)\.(\d+)/;
  const match = url.match(regex);

  if (match) {
    return {
      shopId: match[1] || match[3],
      itemId: match[2] || match[4],
    };
  }
  return null;
};

module.exports = { extractIdsFromProductUrl };
