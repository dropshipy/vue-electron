const { dialog } = require("electron");
const { FilterReplyReviewsByApi } = require("./FilterReplyReviewsByApi");
const { postReplyShop } = require("../../api/interface");
const { waitForTimeout, checkSelector } = require("../../helpers/utils");
const { showSnackbar } = require("../../helpers/snackbar");
const urlGetListReviews =
  "https://seller.shopee.co.id/api/v3/settings/search_shop_rating_comments_new/?SPC_CDS=";
const lastPagePagination =
  "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.eds-react-pagination.my-6.text-center > div > button.eds-react-button.eds-react-pagination-pager__button.eds-react-pagination-pager__button-next.eds-react-button--frameless.eds-react-button--block.eds-react-button--small.eds-react-button--icon-only.disabled > span > svg";

async function AutoReplyReviewsByApi({ page, config }) {
  const { iteration } = config;
  let loopIndex = 1;
  let listReviews = null;

  let getResponseUrl = null;
  let currentResponseUrl = null;

  let endpointReplyShop = null;
  let isLastIndex = false;
  let payload = {
    comment: config.replyMessage,
    comment_id: null,
    order_id: null,
  };
  try {
    const dataReviews = await FilterReplyReviewsByApi(page, config);

    const { isLoading, headers } = dataReviews;

    // const listReviews = await getListOfReviews(newEndpoint, headers);

    page.on("response", async (response) => {
      if (
        response.url().includes(urlGetListReviews) &&
        response.url().includes("reply_status=1") &&
        isLoading
      ) {
        getResponseUrl = response.url();
        const reponseData = await response.json();
        listReviews = reponseData.data.list;
      }
    });

    // monitor whether the data exists for a maximum of 30 seconds
    let isLoadingGetReviewList = 1;
    while (loopIndex <= iteration && !isLastIndex) {
      while (isLoadingGetReviewList < 30 && listReviews == null) {
        await waitForTimeout(1000);
        isLoadingGetReviewList++;
      }
      if (listReviews == null) {
        await page.evaluate(() => {
          window.alert("Program Telah Selesai");
        });
      }
      const isLastPage = await checkSelector(page, lastPagePagination);

      currentResponseUrl = getResponseUrl;
      endpointReplyShop = generateNewUrl(currentResponseUrl);

      let isLoadingNewData = 1;
      if (
        isLoadingNewData < 30 &&
        loopIndex > 1 &&
        currentResponseUrl == getResponseUrl
      ) {
        await waitForTimeout(1000);
        isLoadingNewData++;
      }

      for (let i = 0; i < listReviews.length; i++) {
        if (loopIndex <= iteration) {
          payload = {
            ...payload,
            comment_id: listReviews[i].comment_id,
            order_id: listReviews[i].order_id,
          };

          const testCookie = await page.cookies();
          const postReplyReviews = await postReplyShop(
            endpointReplyShop,
            payload,
            { headers }
          );
          await showSnackbar({
            page,
            message: `Berhasil membalas ulasan: ${listReviews[i].user_name}`,
          });
          await waitForTimeout(2000);
          loopIndex++;
        } else {
          isLastIndex = true;
          break;
        }
      }
      if (isLastIndex) {
        break;
      }
      if (isLastPage) {
        isLastIndex = true;
        await page.evaluate(() => {
          window.alert("Program Telah Selesai");
        });
        break;
      }
      isLoadingGetReviewList = 0;
      isLoadingNewData = 0;

      // click next pagination
      await page.click(
        "#app > div.app-container > div.page-container.responsive-container > div > div > div > div.eds-react-pagination.my-6.text-center > div > button.eds-react-button.eds-react-pagination-pager__button.eds-react-pagination-pager__button-next.eds-react-button--frameless.eds-react-button--block.eds-react-button--small.eds-react-button--icon-only > span"
      );
    }
  } catch (error) {
    await page.evaluate(() => {
      window.alert("Program Telah Selesai");
    });
    console.log(error.message);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
  await page.evaluate(() => {
    window.alert("Program Telah Selesai");
  });
}

function generateNewUrl(currentUrl) {
  const [baseUrl, paramsString] = currentUrl.split("?");

  const newBaseUrl = baseUrl.replace(
    "search_shop_rating_comments_new",
    "reply_shop_rating"
  );

  const params = paramsString.split("&");

  const filteredParams = params.filter(
    (param) =>
      !param.includes("rating_star") &&
      !param.includes("page_number") &&
      !param.includes("page_size") &&
      !param.includes("cursor") &&
      !param.includes("from_page_number") &&
      !param.includes("reply_status")
  );

  const newUrl = `${newBaseUrl}?${filteredParams.join("&")}`;

  return newUrl;
}

module.exports = { AutoReplyReviewsByApi };
